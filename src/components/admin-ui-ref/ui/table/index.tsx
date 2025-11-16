import type React from 'react';
import type { ReactNode } from 'react';

// Props for Table
type TableProps = {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
};

// Props for TableHeader
type TableHeaderProps = {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
};

// Props for TableBody
type TableBodyProps = {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
};

// Props for TableRow
type TableRowProps = {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
};

// Props for TableCell
type TableCellProps = {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
};

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => (
  <table className={`min-w-full ${className}`}>{children}</table>
);

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={className}>{children}</thead>
);

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
  <tbody className={className}>{children}</tbody>
);

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className }) => (
  <tr className={className}>{children}</tr>
);

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? 'th' : 'td';
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

export { Table, TableBody, TableCell, TableHeader, TableRow };
