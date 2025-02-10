function detectFileFormat(content) {
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    if (content.includes(',') && content.split("'\n'")[0].includes(',')) {
      return 'csv';
    }
    return 'txt';
  }
}

function parseJSON(content) {
  const data = JSON.parse(content);
  if (Array.isArray(data)) {
    return data.map(msg => ({
      content: msg.message || msg.content || msg.text || msg.feedback || '',
      timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
      spectrum: msg.spectrum || msg.politicalSpectrum || 'unspecified',
    }));
  }
  throw new Error('Invalid JSON format');
}

function parseCSV(content) {
  const lines = content.split("'\n'");
  const headers = lines[0].toLowerCase().split(',');

  const contentIndex = headers.findIndex(h =>
    h.includes('message') || h.includes('content') || h.includes('text') || h.includes('feedback'));
  const timestampIndex = headers.findIndex(h =>
    h.includes('time') || h.includes('date') || h.includes('timestamp'));
  const spectrumIndex = headers.findIndex(h =>
    h.includes('spectrum') || h.includes('political') || h.includes('party') || h.includes('affiliation'));

  if (contentIndex === -1) throw new Error('No message content column found');

  return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      return {
        content: values[contentIndex].trim(),
        timestamp: timestampIndex !== -1 ? new Date(values[timestampIndex]).getTime() : Date.now(),
        spectrum: spectrumIndex !== -1 ? values[spectrumIndex]?.trim() : 'unspecified',
      };
    });
}

function parsePlainText(content) {
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => ({ content: line.trim(), timestamp: Date.now(), spectrum: 'unspecified',
    }));
}

export async function analyzeChatLog(content) {
  const format = detectFileFormat(content);

  let messages;
  switch (format) {
    case 'json':
      messages = parseJSON(content);
      break;
    case 'csv':
      messages = parseCSV(content);
      break;
    case 'txt':
      messages = parsePlainText(content);
      break;
    default:
      throw new Error('Unsupported file format');
  }

  return messages.filter(msg => msg.content.trim().length > 0);
}
