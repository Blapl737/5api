const dropArea = document.getElementById('dropArea');
const fileInfo = document.getElementById('fileInfo');
const fileContent = document.getElementById('fileContent');
const notifyButton = document.getElementById('notifyButton');
const geoButton = document.getElementById('geoButton');
const geoInfo = document.getElementById('geoInfo');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    const file = files[0];
    if (file) {
        fileInfo.innerHTML = `
            <strong>Имя файла:</strong> ${file.name}<br>
            <strong>Размер:</strong> ${(file.size / 1024).toFixed(2)} КБ<br>
            <strong>Тип:</strong> ${file.type || 'Неизвестный'}
        `;

        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            fileContent.innerHTML = `<strong>Содержимое файла:</strong><br><pre>${text}</pre>`;
        };
        reader.onerror = function() {
            fileContent.innerHTML = '<strong>Ошибка:</strong> Не удалось прочитать файл.';
        };
        reader.readAsText(file);

        sendNotification(`Файл ${file.name} успешно загружен!`);
    }
}

function sendNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Уведомление', {
            body: message,
            icon: 'https://via.placeholder.com/100'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Уведомление', {
                    body: message,
                    icon: 'https://via.placeholder.com/100'
                });
            }
        });
    }
}

notifyButton.addEventListener('click', () => {
    sendNotification('Это тестовое уведомление!');
});

geoButton.addEventListener('click', getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        geoInfo.innerHTML = 'Геолокация не поддерживается вашим браузером.';
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    geoInfo.innerHTML = `
        <strong>Ваши координаты:</strong><br>
        Широта: ${latitude}<br>
        Долгота: ${longitude}
    `;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            geoInfo.innerHTML = 'Ошибка: Пользователь отклонил запрос на геолокацию.';
            break;
        case error.POSITION_UNAVAILABLE:
            geoInfo.innerHTML = 'Ошибка: Информация о местоположении недоступна.';
            break;
        case error.TIMEOUT:
            geoInfo.innerHTML = 'Ошибка: Время ожидания запроса на геолокацию истекло.';
            break;
        case error.UNKNOWN_ERROR:
            geoInfo.innerHTML = 'Ошибка: Произошла неизвестная ошибка.';
            break;
    }
}