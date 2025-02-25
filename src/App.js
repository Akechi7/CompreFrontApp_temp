import React, { useState } from "react";
import axios from "axios";

const DUMMY_MODE = true;  // ダミーモードをONにする場合には、true
const LAMBDA_API_URL = process.env.REACT_APP_LAMBDA_API_URL;

//#region 顔文字を取得する関数
const getEmoji = (sentiment) => {
  switch (sentiment) {
    case "POSITIVE": return "😊";
    case "NEGATIVE": return "😡";
    case "NEUTRAL": return "😐";
    case "MIXED": return "🤔";
    default: return "❓";
  }
};
//#endregion

//#region 感情から背景色を決定する関数
const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case "POSITIVE": return "#4CAF50";
    case "NEGATIVE": return "#F44336";
    case "NEUTRAL": return "#FF9800";
    case "MIXED": return "#2196F3";
    default: return "#757575";
  }
};
//#endregion

//#region (Dummy) ランダムな感情パラメータを返す関数
const getRandomSentimentData = () => {
  const sentiments = ["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"];
  const selectedSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  return {
    Sentiment: selectedSentiment,
    SentimentScore: {
      Positive: Math.random().toFixed(2),
      Negative: Math.random().toFixed(2),
      Neutral: Math.random().toFixed(2),
      Mixed: Math.random().toFixed(2)
    }
  };
};
//#endregion

const App = () => {

  // ---------------状態管理---------------
  const [text, setText] = useState(""); // 入力された文字
  const [emotionList, setEmotionList] = useState([]); // 取得した感情分析の履歴 (リスト形式で管理)
  const [loading, setLoading] = useState(false); // API通信中かどうか
  // ---------------状態管理---------------

  // テキストボックスの入力を text の状態に反映する
  const handleTextChange = (e) => setText(e.target.value);

  //#region 感情分析データを取得する関数
  const fetchEmotionData = async (inputText) => {

    // DUMMY_MODE が true の場合
    if (DUMMY_MODE) {
      console.log("ダミーモード: ランダムな感情データを返します");
      return new Promise((resolve) =>
        setTimeout(() => resolve(getRandomSentimentData()), 1000) // 1秒後にランダムなデータを返す
      );
    }

    // DUMMY_MODE が false の場合
    if (!LAMBDA_API_URL) {
      console.error("LAMBDA_API_URLが設定されていません！");
      return null;
    }
    try {
      // APIにリクエストを送信し結果を取得
      const response = await axios.post(LAMBDA_API_URL, { text: inputText });
      return response.data;
    } catch (error) {
      console.error("Error fetching emotion data:", error);
      return null;
    }
  };
  //#endregion

  //#region 送信ボタンを押したときの処理
  const handleSubmit = async () => {

    // 入力テキストボックスが空⇒何もしない
    if (!text) return;

    // 状態を送信中に
    setLoading(true);

    // データ取得
    const data = await fetchEmotionData(text);
    if (data) {
      // emotionList のリストの先頭に、新しいデータ（入力テキストと感情データ）を追加
      setEmotionList((prevList) => [{ text, ...data }, ...prevList]);
    }

    // 状態をリセット
    setLoading(false);
    setText("");
  };
  //#endregion

  return (
    <div style={{ textAlign: "left", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#333" }}>感情分析アプリケーション</h2> 
      <textarea 
        value={text}
        onChange={handleTextChange}
        placeholder="感情分析したいテキストを入力..."
        rows="4"
        style={{ width: "95%", alignItems: "center", padding: "10px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      <br />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          color: "white",
          backgroundColor: "#6200ea",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? "送信中..." : "送信"}
      </button>
      <div style={{ marginTop: "20px", width: "80%", marginLeft: "auto", marginRight: "auto" }}>
        {emotionList.map((emotionData, index) => (
          <div
            key={index}
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: getSentimentColor(emotionData.Sentiment),
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start"
            }}
          >
            <div style={{ background: "white", color: "black", padding: "8px", borderRadius: "10px", marginBottom: "5px", alignSelf: "flex-start" }}>
              {emotionData.text}
            </div>
            <p style={{ fontSize: "20px", margin: "5px 0" }}>
              {getEmoji(emotionData.Sentiment)} 感情: <strong>{emotionData.Sentiment}</strong>
            </p>
            <pre style={{ textAlign: "left", fontSize: "12px", margin: "5px 0" }}>{JSON.stringify(emotionData.SentimentScore, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
