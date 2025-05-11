document.addEventListener("DOMContentLoaded", function () {
  const chatbotContainer = document.getElementById("chatbot-container");
  const closeBtn = document.getElementById("close-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sendBtn = document.getElementById("send-btn");
  const chatBotInput = document.getElementById("chatbot-input");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotIcon = document.getElementById("chatbot-icon");
  const typingIndicator = document.getElementById("typing-indicator");

  let isFirstOpen = true;
  let conversationHistory = []; // Store conversation for context

  chatbotIcon.addEventListener("click", () => {
    chatbotContainer.classList.remove("hidden");
    chatbotIcon.style.display = "none";
    if (isFirstOpen) {
      displayWelcomeMessage();
      isFirstOpen = false;
    }
  });

  closeBtn.addEventListener("click", () => {
    chatbotContainer.classList.add("hidden");
    chatbotIcon.style.display = "flex";
  });

  clearBtn.addEventListener("click", () => {
    chatbotMessages.innerHTML = "";
    conversationHistory = [];
    displayWelcomeMessage();
  });

  sendBtn.addEventListener("click", sendMessage);

  chatBotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function displayWelcomeMessage() {
    const welcomeMessage = "Hello! I'm AIISH CARE, How can I assist you today?";
    appendMessage("bot", welcomeMessage, true);
    appendQuickReplies([
      { text: "Book Appointment", message: "how can i book an appointment" },
      { text: "Stuttering Help", message: "what kind of exercises help with stuttering" },
      { text: "Clinic Hours", message: "what are the clinic operating hours" },
      { text: "Teletherapy", message: "teletherapy" },
      { text: "Aphasia Info", message: "what is aphasia" }
    ]);
  }

  function appendQuickReplies(replies) {
    const replyContainer = document.createElement("div");
    replyContainer.classList.add("quick-replies");
    replies.forEach(reply => {
      const button = document.createElement("button");
      button.textContent = reply.text;
      button.classList.add("quick-reply-btn");
      button.addEventListener("click", () => {
        appendMessage("user", reply.message);
        getBotResponse(reply.message);
        replyContainer.remove();
      });
      replyContainer.appendChild(button);
    });
    chatbotMessages.appendChild(replyContainer);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function sendMessage() {
    const userMessage = chatBotInput.value.trim();
    if (userMessage) {
      appendMessage("user", userMessage);
      conversationHistory.push({ role: "user", text: userMessage });
      chatBotInput.value = "";
      getBotResponse(userMessage);
    }
  }

  function appendMessage(sender, message, isWelcome = false) {
    const messageContainer = document.getElementById("chatbot-messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    if (isWelcome) messageElement.classList.add("welcome-message");

    const textElement = document.createElement("div");
    textElement.classList.add("message-text");
    textElement.textContent = message;

    const timeElement = document.createElement("div");
    timeElement.classList.add("message-time");
    timeElement.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    messageElement.appendChild(textElement);
    messageElement.appendChild(timeElement);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  async function getBotResponse(userMessage) {
    typingIndicator.classList.remove("hidden");
    const API_KEY = "AIzaSyDlk3x1Gpn9K-Wv48VICK__gy6B-1VUfOY";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const sanitizedMessage = userMessage.replace(/[<>]/g, ""); // Basic sanitization
    const conversationContext = conversationHistory
      .slice(-4) // Limit to last 4 messages for context
      .map(msg => `${msg.role === "user" ? "Patient" : "Assistant"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `
You are AIISH CARE, a professional virtual health assistant for the Centre for Rehabilitation Engineering at AIISH, Mysuru. Respond as a compassionate clinician would, using a warm, empathetic, and professional tone in 1-2 sentences. Maintain context from the conversation history, avoid markdown or emojis, and include a follow-up question to encourage engagement. If the query is unclear or complex, politely ask for clarification or suggest consulting a clinician. Below are example responses for common queries:

- Query: "greetings" or "hi" or "hello"
  Response: Hello, it's nice to assist you today. How can I help with your speech therapy needs?
- Query: "how can i book an appointment" or "appointments"
  Response: You can book an appointment through our online portal, which is quick and easy. Would you like the link to the portal or a guide to get started?
- Query: "what kind of exercises help with stuttering"
  Response: Stuttering therapy includes breathing exercises and fluency-shaping techniques tailored by our clinicians. Would you like to learn about our personalized therapy tools?
- Query: "what are the clinic operating hours"
  Response: Our clinic is open Monday to Friday, 9 AM to 5 PM. Would you like to schedule an appointment during those hours?
- Query: "can i record my therapy session"
  Response: Yes, with your clinician's consent, you can record sessions for review, stored securely for 12 months. Would you like to know more about session features like shared notes?
- Query: "what services are offered" or "speech therapy services"
  Response: We provide speech therapy, audiology, and rehabilitation engineering for various needs. Are you looking for a specific service?
- Query: "teletherapy" or "online therapy"
  Response: Our teletherapy sessions are conducted securely online, offering flexibility. Would you like to book a teletherapy session or learn more?
- Query: "cost of therapy" or "fees"
  Response: Therapy costs depend on the session type, and we can provide a detailed estimate during consultation. Would you like to schedule a consultation to discuss pricing?
- Query: "accessibility features" or "support for disabilities"
  Response: Our platform supports screen readers and adjustable text for accessibility. Would you like details on how we can accommodate specific needs?
- Query: "cancel appointment" or "reschedule appointment"
  Response: You can cancel or reschedule appointments easily through our online portal. Would you like the link to manage your appointment?
- Query: "speech therapy for children" or "pediatric therapy"
  Response: We offer child-friendly speech therapy tailored to young patients' needs. Would you like to arrange a consultation for a child?
- Query: "how to prepare for a session" or "session preparation"
  Response: Prepare a quiet space and any materials recommended by your clinician for a productive session. Would you like tips for a specific therapy type?
- Query: "contact information" or "how to reach the clinic"
  Response: You can contact us at +91-821-2502100 or through our website’s contact form. Would you prefer the website link or more details?
- Query: "what is aphasia" or "aphasia information"
  Response: Aphasia is a condition affecting language comprehension and expression, often caused by brain injury. Would you like to explore therapy options for aphasia?
- Query: "dysarthria" or "what is dysarthria"
  Response: Dysarthria involves difficulty with speech due to muscle weakness, and our therapists can help improve clarity. Would you like to discuss treatment plans for dysarthria?
- Query: "track therapy progress" or "how to monitor progress"
  Response: Your clinician will provide progress reports, and our platform tracks session outcomes. Would you like to schedule a review with your therapist?
- Query: "post-session exercises" or "exercises after therapy"
  Response: Your clinician will assign specific exercises to practice at home, accessible via our portal. Would you like guidance on accessing these materials?
- Query: "insurance" or "does insurance cover therapy"
  Response: Insurance coverage varies, and our office can verify your plan’s benefits. Would you like us to assist with an insurance inquiry?
- Query: "emergency contact" or "urgent help"
  Response: For urgent issues, please call our clinic at +91-821-2502100 or visit the nearest hospital. Can I help with non-urgent questions now?
- Query: "clinician qualifications" or "therapist credentials"
  Response: Our clinicians are certified speech-language pathologists with extensive training. Would you like to know more about our team or book with a specific therapist?
- Default (unrecognized queries)
  Response: I'm not sure I fully understand your question, but I'm here to help. Could you provide more details, or would you like to schedule a consultation?

Conversation history:
${conversationContext}

Current patient query: ${sanitizedMessage}
`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      });

      typingIndicator.classList.add("hidden");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates.length) {
        throw new Error("No response from Gemini API");
      }

      const botMessage = data.candidates[0].content.parts[0].text.trim();
      appendMessage("bot", botMessage);
      conversationHistory.push({ role: "bot", text: botMessage });
    } catch (error) {
      console.error("Error:", error);
      typingIndicator.classList.add("hidden");
      const errorMessage = "I'm sorry, I'm having trouble responding right now. Would you like to try again or contact our clinic directly?";
      appendMessage("bot", errorMessage);
      conversationHistory.push({ role: "bot", text: errorMessage });
    }
  }
});