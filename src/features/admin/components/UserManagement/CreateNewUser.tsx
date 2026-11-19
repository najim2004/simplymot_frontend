"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetUserByIdQuery,
} from "@/features/admin";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import ProfileImageUpload from "@/components/reusable/Common/CommonImage";

interface CreateNewUserProps {
  open: boolean;
  onClose: () => void;
  editUserId?: string | null;
}

const USER_KINDS = [
  { value: "ADMIN", label: "Admin" },
  { value: "GARAGE", label: "Garage" },
  { value: "DRIVER", label: "Customer/Driver" },
];

export default function CreateNewUser({
  open,
  onClose,
  editUserId,
}: CreateNewUserProps) {
  const isEditMode = Boolean(editUserId);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    type: "DRIVER",
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userResponse, isLoading: loadingUser } = useGetUserByIdQuery(
    editUserId || "",
    {
      skip: !editUserId,
    },
  );
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  useEffect(() => {
    if (isEditMode && userResponse?.data && open) {
      const userData = userResponse.data as any;
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        password: "",
        phone_number: userData.phone_number || "",
        type: (userData.kind || userData.type || "DRIVER").toUpperCase(),
      });
      setOriginalEmail(userData.email || "");
      setIsEmailEditable(false);
      setProfileImage(userData.avatar_url || userData.avatar || "");
      setSelectedFile(null);
    } else if (!open) {
      reset();
    }
  }, [isEditMode, userResponse, open]);

  const reset = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      phone_number: "",
      type: "DRIVER",
    });
    setOriginalEmail("");
    setIsEmailEditable(false);
    setProfileImage("");
    setSelectedFile(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && editUserId) {
        const userData = userResponse?.data as any;
        if (!userData) return;

        const currentKind = (
          userData.kind ||
          userData.type ||
          ""
        ).toUpperCase();

        let hasChanges =
          form.name !== userData.name ||
          form.email !== originalEmail ||
          form.phone_number !== (userData.phone_number || "") ||
          form.type !== currentKind ||
          Boolean(selectedFile);

        if (!hasChanges) {
          toast.info("No changes to update");
          onClose();
          return;
        }

        let res;
        if (selectedFile) {
          const formData = new FormData();
          formData.append("id", editUserId);
          formData.append("type", form.type);
          if (form.name !== userData.name) formData.append("name", form.name);
          if (form.email !== originalEmail)
            formData.append("email", form.email);
          if (form.phone_number !== (userData.phone_number || "")) {
            formData.append("phone_number", form.phone_number);
          }
          formData.append("image", selectedFile);
          res = await updateUser(formData).unwrap();
        } else {
          const updatePayload: any = { id: editUserId, type: form.type };
          if (form.name !== userData.name) updatePayload.name = form.name;
          if (form.email !== originalEmail) updatePayload.email = form.email;
          if (form.phone_number !== (userData.phone_number || "")) {
            updatePayload.phone_number = form.phone_number;
          }
          res = await updateUser(updatePayload).unwrap();
        }

        if ((res as any)?.success === false) {
          toast.error((res as any)?.message || "Failed to update");
        } else {
          toast.success("User updated successfully");
          onClose();
        }
      } else {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
          toast.error("Name, email, and password are required");
          return;
        }
        await createUser({ ...form, role_ids: [] }).unwrap();
        toast.success("User created successfully");
        onClose();
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed";
      if (err?.status === 409 || /already exists/i.test(msg)) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <CustomReusableModal
      isOpen={open}
      onClose={() => {
        if (!creating && !updating) onClose();
      }}
      showHeader
      className="max-w-lg!"
      title={isEditMode ? "Edit User" : "Create New User"}
      description={
        isEditMode
          ? "Update user information. Roles are managed from RBAC."
          : "Fill in the details to create a user. Roles are managed from RBAC."
      }
    >
      {loadingUser && isEditMode ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading user...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {isEditMode && (
            <ProfileImageUpload
              profileImage={profileImage}
              onImageClick={() => fileInputRef.current?.click()}
              onImageChange={handleImageChange}
              fileInputRef={fileInputRef}
              onImageError={() => setProfileImage("")}
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                disabled={isEditMode && !isEmailEditable}
                className={
                  isEditMode && !isEmailEditable ? "bg-gray-50 pr-10" : ""
                }
              />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsEmailEditable(!isEmailEditable)}
                  className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-green-600"
                  title={isEmailEditable ? "Lock email" : "Edit email"}
                >
                  <Pencil
                    className={`h-4 w-4 ${isEmailEditable ? "text-green-600" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              type="tel"
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              placeholder="+44 123 456 7890"
            />
          </div>

          {!isEditMode && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kind / Type
            </label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select kind" />
              </SelectTrigger>
              <SelectContent>
                {USER_KINDS.map((kind) => (
                  <SelectItem
                    key={kind.value}
                    className="cursor-pointer"
                    value={kind.value}
                  >
                    {kind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={creating || updating}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
              disabled={creating || updating || loadingUser}
              onClick={handleSubmit}
            >
              {creating || updating
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </div>
      )}
    </CustomReusableModal>
  );
}
