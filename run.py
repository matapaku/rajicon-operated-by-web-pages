from flask import Flask, render_template, request, jsonify
from gpiozero import Servo, LED, Motor
from signal import signal, SIGINT
import sys
from time import sleep
from gpiozero.pins.pigpio import PiGPIOFactory


# Flaskアプリの設定
app = Flask(__name__)

led_state = {"on": False}  # LEDの状態を管理
factory = PiGPIOFactory()

# サーボの初期化 (GPIO 17を使用)
servo = Servo(2, pin_factory=factory)
servo.mid()  # 初期位置を中央に設定

# LEDの初期化 (GPIO 18を使用)
led = LED(20)
led.off()  # 初期状態でLEDを消灯

motor1 = Motor(forward=12, backward=18, pwm=True)
motor2 = Motor(forward=13, backward=19, pwm=True)


# サーボとLEDのピンリセット処理
def cleanup_gpio(signal_received, frame):
    print("プログラムを終了します。GPIOピンをリセット中...")
    servo.mid()
    servo.detach()  # サーボのピンをリセット
    led.off()       # LEDをオフにする
    sys.exit(0)


# SIGINT (Ctrl+C) シグナルをキャッチしてクリーンアップ関数を実行
signal(SIGINT, cleanup_gpio)


# ルートエンドポイント
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/update_servo', methods=['POST'])
def update_servo():
    try:
        position = float(request.form['position'])  # スライダーの値を取得
        # -1.0 ~ 1.0 の範囲でサーボを動かす
        position = (position/5)-0.4
        servo.value = position
        print(f"servo_position:{position}")
        sleep(0.3)  # 少し待つ
        return "OK", 200
    except Exception as e:
        return str(e), 400


# LEDをオン/オフするエンドポイント
@app.route('/toggle_led', methods=['POST'])
def toggle_led():
    # LEDの状態をトグル
    if led.is_lit:
        led.off()
        status = 'off'
    else:
        led.on()
        status = 'on'
    return jsonify({'status': 'success', 'led_state': status})


# モーターの制御
@app.route("/control", methods=["POST"])
def control():
    action = request.json.get("action")
    if action == "stop":
        print("success:stop")
        motor1.stop()
        motor2.stop()

    elif action == "forward":
        print("success:foward")
        motor1.forward(0.3)
        motor2.forward(0.3)

    elif action == "backward":
        print("success:backward")
        motor1.backward(0.3)
        motor2.backward(0.3)

    return {"status": "success"}


if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        servo.mid()
        servo.detach()
        cleanup_gpio()
