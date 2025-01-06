alert("こんにちは");

const servoSlider = document.getElementById("slider");
const ledButton = document.getElementById("ledButton");

// モーターの制御
document.getElementById("motor-foward-box").addEventListener("click", () => updateMotorStatus("forward"));
document.getElementById("stopButton").addEventListener("click", () => updateMotorStatus("stop"));
document.getElementById("motor-backward-box").addEventListener("click", () => updateMotorStatus("backward"));

// statusの更新
const motorStatus = document.getElementById("motor-status");
const ledStatusText = document.getElementById("led-status");



        // function setServo(value) {
        //     value = (value / 50) - 1
        //     value = value.toFixed(2);
        //     document.getElementById('current-value').innerText = value;

        //     // サーバーにスライドバーの値を送信
        //     fetch('/set_servo', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         },
        //         body: 'value=' + value
        //     })
        //     .then(response => response.json())
        //     .then(data => console.log(data))
        //     .catch(error => console.error('Error:', error));
        // }

        const slider = document.getElementById('slider');
        const sliderValue = document.getElementById('sliderValue');

        // スライダーを動かしたときにイベント発火
        slider.addEventListener('input', () => {
            const position = slider.value;
            sliderValue.textContent = position;

            // サーバーに値を送信
            fetch('/update_servo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `position=${position}`
            }).then(response => {
                if (!response.ok) {
                    console.error('サーバーエラー:', response.statusText);
                }
            }).catch(error => console.error('通信エラー:', error));
        });


        ledButton.addEventListener("click", () => {
            fetch("/toggle_led", {
                method: "POST",
            })
                .then(response => {
                    
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    // サーバーから返されたLEDの状態で画面を更新
                    ledStatusText.textContent = data.led.toUpperCase();
                })
                .catch(error => {
                    console.error("Error:", error);
                    ledStatusText.textContent = "Error";
                });
        });

        // function motorForward() {

        //     fetch('/motor_forward', {
        //         method: 'POST'
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         document.getElementById('motor-status').innerText = 'Forward';
        //     })
        //     .catch(error => console.error('Error:', error));
        // }

        // function motorBackward() {
        //     fetch('/motor_backward', {
        //         method: 'POST'
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         document.getElementById('motor-status').innerText = 'Backward';
        //     })
        //     .catch(error => console.error('Error:', error));
        // }

        // function motorStop() {
        //     fetch('/motor_stop', {
        //         method: 'POST'
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         document.getElementById('motor-status').innerText = 'Stopped';
        //     })
        //     .catch(error => console.error('Error:', error));
        // }

        // 関数の実行
        // 前の関数

        function updateMotorStatus(action) {
            sendCommand(action)
                .then(() => {
                    // サーバーから成功レスポンスを受け取ったら状態を更新
                    if (action === "forward") {
                        motorStatus.textContent = "Forward";
                    } else if (action === "stop") {
                        motorStatus.textContent = "Stop";
                    } else if (action === "backward") {
                        motorStatus.textContent = "Backward";
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    motorStatus.textContent = "Error";
                });
        }

        // サーバーにコマンドを送信する関数
        function sendCommand(action) {
            return fetch("/control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            }).then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            });
        }

