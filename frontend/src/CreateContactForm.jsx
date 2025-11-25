import { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

function CreateContactForm() {
  // Form fields state
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Ensure required fields
    if (!formData.firstname || !formData.lastname || !formData.email) {
      setError("Please fill in firstname, lastname, and email.");
      return;
    }

    setLoading(true);

    try {
      /**
       * Send POST request to backend.
       */
      const response = await fetch("http://localhost:3001/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        //  Required HubSpot format
        body: JSON.stringify({
          properties: { ...formData },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create contact in HubSpot");
      }

      // Success message with HubSpot ID
      setSuccess(
        `🎉 Contact created successfully in HubSpot! Contact ID: ${data.id}`
      );

      // Reset form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm">
      <h4 className="mb-3">Create HubSpot Contact</h4>

      {/* Error and success alerts */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* First Name */}
      <Form.Group className="mb-3" controlId="firstname">
        <Form.Label>First Name *</Form.Label>
        <Form.Control
          type="text"
          name="firstname"
          placeholder="Enter first name"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* Last Name */}
      <Form.Group className="mb-3" controlId="lastname">
        <Form.Label>Last Name *</Form.Label>
        <Form.Control
          type="text"
          name="lastname"
          placeholder="Enter last name"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* Email */}
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email *</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* Phone */}
      <Form.Group className="mb-3" controlId="phone">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          placeholder="Optional"
          value={formData.phone}
          onChange={handleChange}
        />
      </Form.Group>

      {/* Address */}
      <Form.Group className="mb-3" controlId="address">
        <Form.Label>Address</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="address"
          placeholder="Optional"
          value={formData.address}
          onChange={handleChange}
        />
      </Form.Group>

      {/* Submit button */}
      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Creating in HubSpot...
          </>
        ) : (
          "Create Contact"
        )}
      </Button>
    </Form>
  );
}

export default CreateContactForm;
