
/**
 * Utility functions for handling CSV files
 */

/**
 * Generate and download a CSV file with sample data
 * @param filename The name of the file to download
 * @param headers Column headers
 * @param sampleRows Sample data rows
 */
export const downloadSampleCsv = (
  filename: string,
  headers: string[],
  sampleRows: string[][]
) => {
  // Create CSV content
  const headerRow = headers.join(',');
  const dataRows = sampleRows.map(row => row.join(','));
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
  // Create a link element and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
