
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

/**
 * Parse and validate a CSV file
 * @param file CSV file to parse
 * @param requiredHeaders Required column headers
 * @param validateRow Function to validate each row
 * @returns Promise that resolves with the parsed and validated data
 */
export const parseAndValidateCsv = (
  file: File,
  requiredHeaders: string[],
  validateRow?: (row: Record<string, string>) => { valid: boolean; error?: string }
): Promise<{ data: Record<string, string>[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    // Use Papa Parse to parse the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        try {
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(header => header.trim());
          
          // Validate required headers
          const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
          
          if (missingHeaders.length > 0) {
            resolve({
              data: [],
              errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
            });
            return;
          }
          
          const result: Record<string, string>[] = [];
          const errors: string[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = lines[i].split(',').map(value => value.trim());
            const row: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            if (validateRow) {
              const validation = validateRow(row);
              if (!validation.valid) {
                errors.push(`Row ${i}: ${validation.error || 'Invalid data'}`);
                continue;
              }
            }
            
            result.push(row);
          }
          
          resolve({ data: result, errors });
        } catch (err) {
          reject(new Error('Failed to parse CSV file. Please check the format.'));
        }
      }
    };
    reader.readAsText(file);
  });
};
