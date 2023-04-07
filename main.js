const API_KEY = "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";

let conversationHistory = [];

async function generateSQL(question) {
  // Add the user's question to the conversation history
  conversationHistory.push({ role: "user", content: `Generate a Snowflake SQL query to answer the question: ${question}` });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const generatedSQL = data.choices[0].message.content.trim();

  // Add the generated SQL to the conversation history
  conversationHistory.push({ role: "assistant", content: generatedSQL });

  return generatedSQL;
}

function updateConversationHistory() {
  const historyElement = document.getElementById("conversationHistory");
  historyElement.innerHTML = "";

  conversationHistory.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.role}`;
    messageElement.textContent = `${message.role === "user" ? "You: " : "Assistant: "}${message.content}`;
    historyElement.appendChild(messageElement);
  });
}

document.getElementById("queryForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = document.getElementById("question").value;
  const loadingElement = document.getElementById("loading");
  const sqlResultElement = document.getElementById("sqlResult");

  if (question) {
    try {
      loadingElement.classList.remove("hidden");
      const sqlResult = await generateSQL(question);
      loadingElement.classList.add("hidden");
      sqlResultElement.textContent = sqlResult;
      updateConversationHistory();
    } catch (error) {
      loadingElement.classList.add("hidden");
      sqlResultElement.textContent = `Error: ${error.message}`;
    }
  } else {
    sqlResultElement.textContent = 'Please enter a question.';
  }
});
