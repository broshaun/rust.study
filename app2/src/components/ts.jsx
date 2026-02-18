

const uploadFile = useCallback((fileInputId) => {
    const fileInput = document.getElementById(fileInputId);
    const file = fileInput?.files[0];
    if (!file) return;
    return file
  }, [httpFiles]);




  <input type="file" id={fileInputId} accept="image/*" />