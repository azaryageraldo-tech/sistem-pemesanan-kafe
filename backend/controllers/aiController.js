const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi dengan kunci API dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fungsi untuk rekomendasi satu arah
const getMenuRecommendation = async (req, res) => {
  try {
    const { menuList, cartItems } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Anda adalah asisten virtual di sebuah kafe. Tugas Anda adalah memberikan rekomendasi menu yang menarik kepada pelanggan.
    
    Berikut adalah daftar menu yang tersedia:
    ${JSON.stringify(menuList)}

    Pelanggan saat ini memiliki item berikut di keranjangnya:
    ${JSON.stringify(cartItems)}

    Berikan satu rekomendasi menu tambahan yang cocok dengan isi keranjang atau yang paling populer dari daftar. Berikan jawaban dalam satu paragraf singkat (maksimal 3 kalimat) dengan gaya bahasa yang ramah dan persuasif. Langsung sebutkan nama menunya.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ success: true, recommendation: text });

  } catch (error) {
    console.error("AI recommendation error:", error);
    res.status(500).json({ success: false, message: "Gagal mendapatkan rekomendasi AI." });
  }
};

// Fungsi untuk chatbot interaktif
const chatWithAI = async (req, res) => {
  try {
    const { menuList, chatHistory } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Memformat riwayat untuk API Gemini
    const history = chatHistory.map(message => ({
      role: message.role,
      parts: [{ text: message.text }]
    }));

    // Ambil pesan terakhir dari pengguna untuk dikirim
    const userMessage = history.pop().parts[0].text;

    // Mulai sesi chat dengan riwayat sebelumnya
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    // Kirim pesan baru dari pengguna
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ success: true, reply: text });

  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, message: "Gagal mendapatkan balasan AI." });
  }
};

module.exports = { 
  getMenuRecommendation,
  chatWithAI
};