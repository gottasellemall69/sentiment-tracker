function scrapeComments() {
    const comments = [];
    
    // Select all comment wrappers by their class name
    const commentWrappers = document.querySelectorAll('.comment-wrapper');
  
    commentWrappers.forEach((commentWrapper) => {
      const commentId = commentWrapper.closest('[id^="comment-"]').id; // Get the comment's ID
      const feedback = commentWrapper.textContent.trim().replace(/,/g, ""); // Extract the comment text and remove commas
  
      // Extract the timestamp
      const timestampElement = commentWrapper.parentElement.querySelector(
        'div[style*="font-size: 12px"][style*="margin-top: 5px"]'
      );
      const rawTimestamp = timestampElement ? timestampElement.textContent.trim() : "";
      const timestamp = formatTimestamp(rawTimestamp); // Convert to ISO format
  
      // Extract the political spectrum/author info
      const authorElement = document.querySelector(
        `#${commentId} > div > div > div.indentation-610192377 > div.metaRow-1056220706 > div.authorInfo-697242276 > a > div`
      );
      const politicalSpectrum = authorElement ? authorElement.textContent.trim().replace(/,/g, "") : ""; // Remove commas
  
      // Add to comments array
      comments.push({
        Timestamp: timestamp, // Correct placement of timestamp
        Feedback: feedback,
        PoliticalSpectrum: politicalSpectrum
      });
    });
  
    // Create plain text and JSON output
    const plainText = comments
      .map(
        (comment) =>
          `${comment.Timestamp} "${comment.Feedback}" "${comment.PoliticalSpectrum}"`
      )
      .join("\n");
  
    const jsonOutput = JSON.stringify(comments, null, 2);
  
    // Log plain text and JSON in console
    console.log("Plain Text Output:\n", plainText);
    console.log("\nJSON Output:\n", jsonOutput);
  
    // Optionally download the outputs as files
    downloadFile("comments.txt", plainText);
    downloadFile("comments.json", jsonOutput);
  }
  
  // Function to convert timestamp to ISO 8601 format
  function formatTimestamp(rawTimestamp) {
    if (!rawTimestamp) return "";
    
    // Example input: "Jan 24, 2025 at 05:32:25 PM"
    const [datePart, timePart] = rawTimestamp.split(" at ");
    const date = new Date(`${datePart}, ${new Date().getFullYear()} ${timePart}`);
    
    // Convert to ISO format
    return date.toISOString();
  }
  
  // Function to download a file
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Run the function
  scrapeComments();
  