import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableColumn {
  key: string;
  label: string | React.ReactNode;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  /** When false, content is not wrapped in a truncating div (e.g. icon buttons). Default true. */
  truncate?: boolean;
}

interface TableAction {
  label: string;
  onClick?: (row: any) => void;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  render?: (row: any) => React.ReactNode;
}

interface ReusableTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  /** Header label for the actions column (default "Actions") */
  actionsColumnLabel?: string;
  /** Pin actions column to the start (left) or end (right). Default "end". */
  actionsPosition?: "start" | "end";
  /** Keep the actions column visible during horizontal scroll (requires actionsPosition="start"). */
  stickyActionsColumn?: boolean;
  onRowClick?: (row: any) => void;
  /** Optional per-row class (e.g. highlight hidden garages) */
  getRowClassName?: (row: any) => string;
  className?: string;
  isLoading?: boolean;
  skeletonRows?: number;
}

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

export default function ReusableTable({
  data,
  columns,
  actions,
  actionsColumnLabel = "Actions",
  actionsPosition = "end",
  stickyActionsColumn = false,
  onRowClick,
  getRowClassName,
  className = "",
  isLoading = false,
  skeletonRows = 5,
}: ReusableTableProps) {
  // Use data directly (no pagination here)
  const tableData = data;
  const hasActions = Boolean(actions && actions.length > 0);
  const actionsAtStart = actionsPosition === "start";
  const stickyActions = stickyActionsColumn && actionsAtStart && hasActions;
  const stickyHeadClass = stickyActions
    ? "sticky left-0 z-20 min-w-[96px] w-[96px] bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]"
    : "";
  const stickyCellClass = stickyActions
    ? "sticky left-0 z-10 min-w-[96px] w-[96px] bg-white shadow-[1px_0_0_0_#e5e7eb]"
    : "";

  const renderCellContent = (column: TableColumn, row: any) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.key === "status" && typeof value === "string") {
      const statusClass =
        statusColors[value.toLowerCase() as keyof typeof statusColors] ||
        statusColors.default;
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    }

    return value;
  };

  const renderActionCells = (row: any) => {
    if (!hasActions || !actions) return null;

    return (
      <TableCell
        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${stickyCellClass}`}
      >
        <div className="flex space-x-2">
          {actions.map((action, actionIndex) =>
            action.render ? (
              <React.Fragment key={actionIndex}>
                {action.render(row)}
              </React.Fragment>
            ) : (
              <button
                key={actionIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(row);
                }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  action.variant === "danger"
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : action.variant === "success"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : action.variant === "warning"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } ${action.className || ""}`}
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      </TableCell>
    );
  };

  const renderActionHeader = () => {
    if (!hasActions) return null;

    return (
      <TableHead
        scope="col"
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${stickyHeadClass}`}
      >
        {actionsColumnLabel}
      </TableHead>
    );
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }).map((_, rowIndex) => (
      <TableRow key={`skeleton-${rowIndex}`}>
        {actionsAtStart && hasActions && (
          <TableCell className={`px-6 py-4 ${stickyCellClass}`}>
            <Skeleton className="h-8 w-20" />
          </TableCell>
        )}
        {columns.map((column, colIndex) => (
          <TableCell
            key={`skeleton-cell-${rowIndex}-${colIndex}`}
            style={{ width: column.width }}
            className="px-6 py-4"
          >
            {column.key === "checkbox" ? (
              <Skeleton className="h-4 w-4 rounded" />
            ) : column.key === "driver_details" || column.key === "__info" ? (
              <Skeleton className="h-9 w-9 rounded-md mx-auto" />
            ) : (
              <Skeleton className="h-4 w-full" />
            )}
          </TableCell>
        ))}
        {!actionsAtStart && hasActions && (
          <TableCell className="px-6 py-4">
            <Skeleton className="h-8 w-20" />
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className={className}>
      {/* Table */}
      <div className="overflow-x-auto rounded-t-lg border border-gray-300">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              {actionsAtStart && renderActionHeader()}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  scope="col"
                  style={{ width: column.width }}
                  className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden"
                >
                  {column.label}
                </TableHead>
              ))}
              {!actionsAtStart && renderActionHeader()}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading
              ? renderSkeletonRows()
              : tableData?.map((row, index) => (
                  <TableRow
                    key={row.id ?? row._id ?? `row-${index}`}
                    className={[
                      onRowClick ? "cursor-pointer" : "",
                      getRowClassName?.(row) ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined}
                    onClick={
                      onRowClick
                        ? () => {
                            onRowClick(row);
                          }
                        : undefined
                    }
                  >
                    {actionsAtStart && renderActionCells(row)}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        style={{ width: column.width }}
                        className="px-6 py-4 text-sm text-gray-900 overflow-hidden"
                      >
                        {column.truncate === false ? (
                          renderCellContent(column, row)
                        ) : (
                          <div className="truncate">
                            {renderCellContent(column, row)}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    {!actionsAtStart && renderActionCells(row)}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {!isLoading && tableData?.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No data found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No data available to display.
          </p>
        </div>
      )}
    </div>
  );
}
