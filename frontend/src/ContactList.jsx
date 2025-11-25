import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button"; //
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Contactform from "./Contactforms";
import ViewAssociateDeals from "./modalViewAssociatedDeals";

function ContactList() {
  const [contacts, setContacts] = useState(
    []
  ); /* state to control main section */
  const [loading, setLoading] = useState(true); /* For loading state */
  const [error, setError] = useState(null); /* Errro handle */

  /* render as the component loads*/
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchContacts();
      hasFetched.current = true;
    }
  }, []);

  /* fetch contact using backend server */
  const fetchContacts = async () => {
    setLoading(true); // start loading
    setError(null); // reset errors

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
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 style={{ padding: "15px" }}>Customer</h1>
        <Contactform />
      </div>

      {/* loading state */}
      {loading && (
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}

      {/* Error state */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <Table striped="columns">
          <thead>
            <tr>
              <th></th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Job Title</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <ViewAssociateDeals contact={contact.id} />
                </td>
                <td>{contact.properties.firstname}</td>
                <td>{contact.properties.lastname}</td>
                <td>{contact.properties.email}</td>
                <td>{contact.properties.jobtitle}</td>
                <td>{contact.properties.company}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default ContactList;
