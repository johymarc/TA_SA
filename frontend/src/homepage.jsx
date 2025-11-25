import { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // AUTO SCROLL REF
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    setErrorMsg(null);

    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log(err);

        // Handle 404 returned by backend for missing contact or deal
        if (err.details?.notFound) {
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: `${err.details.message}. ${err.details.suggestion}`,
            },
          ]);
          setLoading(false);
          return;
        }

        throw new Error(err.details || "Unknown server error");
      }

      const data = await res.json();

      if (!data?.content) {
        throw new Error("Invalid response from server.");
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.content },
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");

      // Show fallback message
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "⚠️ I’m sorry, something went wrong while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ padding: "7px" }}>Welcome Home</h1>
      <h5>chat with your data</h5>

      <Container fluid className="p-4" style={{ height: "70vh" }}>
        <Row className="justify-content-center h-100">
          <Col xs={12} md={8} lg={6} className="d-flex flex-column">
            {/* Error Alert */}
            {errorMsg && (
              <Alert
                variant="danger"
                onClose={() => setErrorMsg(null)}
                dismissible
              >
                <strong>Error:</strong> {errorMsg}
              </Alert>
            )}

            {/* Chat Messages */}
            <Card className="flex-grow-1 mb-3 shadow-sm">
              <Card.Body
                style={{
                  overflowY: "scroll",
                  maxHeight: "40vh",
                  paddingBottom: "60px",
                }}
              >
                {messages
                  .filter((m) => m.role !== "system")
                  .map((m, i) => (
                    <div key={i} className="d-flex mb-3">
                      <div
                        className={`p-3 rounded ${
                          m.role === "user"
                            ? "bg-primary text-white ms-auto"
                            : "bg-light border me-auto"
                        }`}
                        style={{ maxWidth: "75%" }}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                {loading && (
                  <div className="d-flex mb-3">
                    <div className="p-3 rounded bg-light border me-auto">
                      <Spinner size="sm" animation="border" className="me-2" />
                      Typing…
                    </div>
                  </div>
                )}

                {/* AUTO SCROLL TARGET */}
                <div ref={chatEndRef}></div>
              </Card.Body>
            </Card>

            {/* Input Form */}
            <Form onSubmit={sendMessage} className="mt-auto">
              <Row>
                <Col xs={9}>
                  <Form.Control
                    type="text"
                    value={input}
                    disabled={loading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      loading ? "Please wait…" : "Ask me about your data…"
                    }
                  />
                </Col>
                <Col xs={3}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={loading || !input.trim()}
                  >
                    {loading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Chat;
