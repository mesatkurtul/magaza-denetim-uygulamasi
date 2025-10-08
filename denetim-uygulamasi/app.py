from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Denetim soruları ve puanları
# Her soruya bir 'id' ekleyerek form gönderiminde hangi soruya cevap verildiğini kolayca takip edebiliriz.
QUESTIONS = [
    {"id": "q1", "text": "Mağaza vitrini temiz ve düzenli mi?", "points": 20},
    {"id": "q2", "text": "Personel güler yüzlü ve yardımsever mi?", "points": 25},
    {"id": "q3", "text": "Ürün rafları dolu ve etiketler doğru mu?", "points": 25},
    {"id": "q4", "text": "Mağaza içi genel temizlik yeterli mi?", "points": 15},
    {"id": "q5", "text": "Kasa alanı düzenli ve hızlı mı?", "points": 15}
]
MAX_SCORE = sum(q['points'] for q in QUESTIONS)

@app.route('/')
def index():
    """Ana sayfa, denetimi başlatmak için bir form gösterir."""
    return render_template('index.html')

@app.route('/audit', methods=['POST'])
def audit():
    """Denetim sorularını gösteren sayfa."""
    store_name = request.form.get('store_name')
    if not store_name:
        return redirect(url_for('index'))
    return render_template('audit.html', store_name=store_name, questions=QUESTIONS)

@app.route('/submit', methods=['POST'])
def submit():
    """Denetim formunu işler, puanı hesaplar ve sonucu gösterir."""
    store_name = request.form.get('store_name')
    total_points = 0

    for question in QUESTIONS:
        # Formdan gelen cevap 'yes' ise sorunun puanını toplama ekle.
        # Cevap 'yes' değilse (yani 'no' ise veya cevap yoksa) 0 puan eklenir.
        if request.form.get(question['id']) == 'yes':
            total_points += question['points']

    # Puanı 100'lük sisteme çevir
    score_100 = (total_points / MAX_SCORE) * 100 if MAX_SCORE > 0 else 0

    return render_template('result.html', store_name=store_name, score=round(score_100))

if __name__ == '__main__':
    app.run(debug=True)