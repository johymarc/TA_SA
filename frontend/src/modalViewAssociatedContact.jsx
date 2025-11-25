import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

function ViewAssociatecontact({ deal }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchAssociatedContact();
  };

  const [contacs, setcontacts] = useState([]);
  const [account, setAccount] = useState(null); /* for the embed CRM */
  const [loading, setLoading] = useState(true); /* For loading state */
  const [error, setError] = useState(null); /* Errro handle */

  /* render as the component loads*/
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAssociatedContact();
      hasFetched.current = true;
    }
  }, []);

  /* fetch associated Contact using backend server */
  const fetchAssociatedContact = async () => {
    setLoading(true); // start loading
    setError(null); // reset errors

    try {
      const response = await fetch(
        `http://localhost:3001/api/deals/${deal}/contacts`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setcontacts([...data.results].reverse());
      console.log([...data.results].reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* fetch associated deals using backend server */
  const fetchaccount = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/account`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setAccount(data.portalId);
      console.log(data);

      setTimeout(() => {
        window.open(
          `https://app.hubspot.com/embed/${data.portalId}/0-3/${deal}`,
          "_blank",
          "noreferrer"
        );
      }, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline-primary"
        onClick={handleShow}
        style={{ marginLeft: "15px" }}
      >
        View Contact
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  <th>Full name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {contacs.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      {contact.properties.firstname +
                        "  " +
                        contact.properties.lastname}
                    </td>
                    <td>{contact.properties.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={fetchaccount}>
            View more
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ViewAssociatecontact;
