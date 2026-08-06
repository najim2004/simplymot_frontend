import React from 'react'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useCreateUserMutation, useUpdateUserMutation, useGetUserByIdQuery, useGetRolesQuery } from "@/features/admin";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import RoleList from './RoleList'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import ProfileImageUpload from '@/components/reusable/Common/CommonImage'

interface CreateNewUserProps {
    open: boolean
    onClose: () => void
    editUserId?: string | null
}

export default function CreateNewUser({ open, onClose, editUserId }: CreateNewUserProps) {
    const isEditMode = Boolean(editUserId)
    const [form, setForm] = React.useState({ name: '', email: '', password: '', phone_number: '', type: 'ADMIN' })
    const [originalEmail, setOriginalEmail] = React.useState('')
    const [isEmailEditable, setIsEmailEditable] = React.useState(false)
    const [roleIds, setRoleIds] = React.useState<string[]>([])
    const { data: rolesResp } = useGetRolesQuery()
    const { data: userResponse, isLoading: loadingUser } = useGetUserByIdQuery(editUserId || '', { skip: !editUserId })
    const [createUser, { isLoading: creating }] = useCreateUserMutation()
    const [updateUser, { isLoading: updating }] = useUpdateUserMutation()
    const [rolesOpen, setRolesOpen] = React.useState(false)
    const [showPwd, setShowPwd] = React.useState(false)
    const [profileImage, setProfileImage] = React.useState('')
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (isEditMode && userResponse?.data && open) {
            const userData = userResponse.data
            setForm({
                name: userData.name || '',
                email: userData.email || '',
                password: '',
                phone_number: userData.phone_number || '',
                type: userData.type || 'ADMIN'
            })
            setOriginalEmail(userData.email || '')
            setIsEmailEditable(false)
            setRoleIds((userData.roles || []).map((r: any) => r.id))
            setProfileImage(userData.avatar_url || userData.avatar || '')
            setSelectedFile(null)
        } else if (!open) {
            reset()
        }
    }, [isEditMode, userResponse, open])

    React.useEffect(() => {
        if (form.type !== 'ADMIN' && roleIds.length > 0) {
            setRoleIds([])
        }
    }, [form.type, roleIds.length])

    const reset = () => {
        setForm({ name: '', email: '', password: '', phone_number: '', type: 'ADMIN' })
        setRoleIds([])
        setOriginalEmail('')
        setIsEmailEditable(false)
        setProfileImage('')
        setSelectedFile(null)
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageError = () => {
        setProfileImage('')
    }

    return (
        <>
            <CustomReusableModal
                isOpen={open}
                onClose={() => { if (!creating && !updating) onClose() }}
                showHeader
                className="!max-w-lg"
                title={isEditMode ? "Edit User" : "Create New User"}
                description={isEditMode ? "Update user information." : "Fill in the details to create a user."}
            >
                {loadingUser && isEditMode ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600">Loading user...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isEditMode && (
                            <ProfileImageUpload
                                profileImage={profileImage}
                                onImageClick={handleImageClick}
                                onImageChange={handleImageChange}
                                fileInputRef={fileInputRef}
                                onImageError={handleImageError}
                            />
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com"
                                    disabled={isEditMode && !isEmailEditable}
                                    className={isEditMode && !isEmailEditable ? 'bg-gray-50 pr-10' : ''}
                                />
                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEmailEditable(!isEmailEditable)}
                                        className="absolute inset-y-0 right-2 my-auto h-8 w-8 flex items-center justify-center text-gray-500 hover:text-green-600 cursor-pointer transition-colors"
                                        title={isEmailEditable ? "Lock email" : "Edit email"}
                                    >
                                        <Pencil className={`w-4 h-4 ${isEmailEditable ? 'text-green-600' : ''}`} />
                                    </button>
                                )}
                            </div>
                            {isEditMode && !isEmailEditable && (
                                <p className="text-xs text-gray-500 mt-1">Click <Pencil className="inline w-3 h-3" /> to edit email</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <Input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+44 123 456 7890" />
                        </div>
                        {!isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute inset-y-0 right-2 my-auto h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer">
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                <SelectTrigger className='cursor-pointer'>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className='cursor-pointer' value="ADMIN">Admin</SelectItem>
                                    <SelectItem className='cursor-pointer' value="GARAGE">Garage</SelectItem>
                                    <SelectItem className='cursor-pointer' value="DRIVER">Driver</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {form.type === 'ADMIN' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                                <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="w-full h-10 rounded-md border border-gray-300 px-3 cursor-pointer text-left text-sm flex items-center justify-between">
                                            <span className="truncate">
                                                {roleIds.length === 0 ? 'Select roles' : `${roleIds.length} role(s) selected`}
                                            </span>
                                            <svg className="w-4 h-4 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className=" p-2 overflow-auto">
                                        <RoleList
                                            roles={(rolesResp?.data?.roles || [])}
                                            selectedIds={roleIds}
                                            onToggle={(id) => setRoleIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                                            isDisabled={(r) => r.name === 'super_admin'}
                                        />
                                        <div className="pt-3 flex justify-between gap-2">
                                            <Button variant="outline" className="!h-7 px-2 !text-sm cursor-pointer" onClick={() => setRoleIds([])}>Clear</Button>

                                            <Button className="!h-7 px-3 bg-emerald-600 hover:bg-emerald-700 !text-sm cursor-pointer" onClick={() => setRolesOpen(false)}>Done</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ) : null}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" className="cursor-pointer" onClick={() => onClose()} disabled={creating || updating}>Cancel</Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                disabled={creating || updating || loadingUser}
                                onClick={async () => {
                                    try {
                                        if (isEditMode && editUserId) {
                                            const userData = userResponse?.data
                                            if (!userData) return

                                            const updatePayload: any = {
                                                id: editUserId,
                                                type: form.type
                                            }
                                            let hasChanges = false

                                            if (form.name !== userData.name) {
                                                updatePayload.name = form.name
                                                hasChanges = true
                                            }

                                            if (form.email !== originalEmail) {
                                                updatePayload.email = form.email
                                                hasChanges = true
                                            }

                                            if (form.phone_number !== (userData.phone_number || '')) {
                                                updatePayload.phone_number = form.phone_number
                                                hasChanges = true
                                            }

                                            if (form.type !== userData.type) {
                                                hasChanges = true
                                            }

                                            if (selectedFile) {
                                                hasChanges = true
                                            }

                                            if (!hasChanges) {
                                                toast.info('No changes to update')
                                                onClose()
                                                return
                                            }

                                            let res
                                            if (selectedFile) {
                                                const formData = new FormData()
                                                formData.append('id', editUserId)
                                                formData.append('type', form.type)
                                                if (form.name !== userData.name) {
                                                    formData.append('name', form.name)
                                                }
                                                if (form.email !== originalEmail) {
                                                    formData.append('email', form.email)
                                                }
                                                if (form.phone_number !== (userData.phone_number || '')) {
                                                    formData.append('phone_number', form.phone_number)
                                                }
                                                formData.append('image', selectedFile)
                                                res = await updateUser(formData).unwrap()
                                            } else {
                                                res = await updateUser(updatePayload).unwrap()
                                            }

                                            if ((res as any)?.success === false) {
                                                const msg = (res as any)?.message || 'Failed to update'
                                                toast.error(msg)
                                            } else {
                                                toast.success('User updated successfully')
                                                onClose()
                                            }
                                        } else {
                                            await createUser({ ...form, role_ids: roleIds }).unwrap()
                                            toast.success('User created successfully')
                                            onClose()
                                        }
                                    } catch (err: any) {
                                        const status = err?.status
                                        const msg = err?.data?.message || err?.message || 'Failed'
                                        if (status === 409 || /already exists/i.test(msg)) {
                                            toast.error('Email already exists. Please use a different email.')
                                        } else {
                                            toast.error(msg)
                                        }
                                    }
                                }}
                            >
                                {creating || updating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </div>
                )}
            </CustomReusableModal>
        </>
    )
}
