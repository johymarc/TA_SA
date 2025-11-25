import { useState, useEffect, useRef } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

function CreateDealForm() {
  // Form fields state
  const [formData, setFormData] = useState({
    dealname: "",
    amount: "",
    dealstage: "",
  });

  const [contacts, setContacts] = useState(
    []
  ); /* state to control main section */
  const [contacid, setContacId] =
    useState(); /* state to control main section */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* render as the component loads*/
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchContacts();
      hasFetched.current = true;
    }
  }, []);

  // Update form state on input change
  const handleChange = (e) => {
    console.log(e.target.name);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeContact = (e) => {
    console.log(e.target.value);
    setContacId(e.target.value);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Ensure required fields
    if (!formData.dealname || !formData.dealstage) {
      setError("Please fill in dealname, dealstage");
      return;
    }

    if (!contacid) {
      setError("Please select a contact");
      return;
    }

    setLoading(true);

    try {
      /**
       * Send POST request to backend.
       */

      const response = await fetch("http://localhost:3001/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        //  Required HubSpot format
        body: JSON.stringify({
          dealProperties: { ...formData },
          contactId: contacid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create deal in HubSpot");
      }

      // Success message with HubSpot ID
      setSuccess(
        `🎉 Deal created successfully in HubSpot! Contact ID: ${data.id}`
      );

      // Reset form
      setFormData({
        dealname: "",
        amount: "",
        dealstage: "",
      });
      setContacId("");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  /* fetch contact using backend server */
  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/contacts");

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setContacts([...data.results].reverse());
      console.log([...data.results].reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm">
      <h4 className="mb-3">Create HubSpot Deal</h4>

      {/* Error and success alerts */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* dealname*/}
      <Form.Group className="mb-3" controlId="dealname">
        <Form.Label>Deal Name *</Form.Label>
        <Form.Control
          type="text"
          name="dealname"
          placeholder="e.g., Premium Subscription - Annual"
          value={formData.dealname}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* amount */}
      <Form.Group className="mb-3" controlId="amount">
        <Form.Label>Amount *</Form.Label>
        <Form.Control
          type="number"
          name="amount"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* dealstage */}
      <Form.Group className="mb-3" controlId="dealstage">
        <Form.Label>Deal Stage *</Form.Label>
        <Form.Select
          name="dealstage"
          value={formData.dealstage}
          onChange={handleChange}
          required
        >
          <option>Select a Stage</option>
          <option value="appointmentscheduled">Trial started</option>
          <option value="qualifiedtobuy">Active trial user</option>
          <option value="closedwon">Converted to paid subscription</option>
          <option value="closedlost">Trial ended without conversion</option>
        </Form.Select>
      </Form.Group>

      {/* Contact */}
      <Form.Group className="mb-3" controlId="contact">
        <Form.Label>Contact *</Form.Label>
        <Form.Select value={contacid} onChange={handleChangeContact} required>
          <option value="">Select a Contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.properties.email}
            </option>
          ))}
        </Form.Select>
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
          "Create Deal"
        )}
      </Button>
    </Form>
  );
}

export default CreateDealForm;
