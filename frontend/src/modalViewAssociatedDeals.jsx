import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

function ViewAssociateDeals({ contact }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    fetchAssociatedDeals();
  };

  const [deals, setDeals] = useState([]);
  const [account, setAccount] = useState(null); /* for the embed CRM */
  const [loading, setLoading] = useState(true); /* For loading state */
  const [error, setError] = useState(null); /* Errro handle */

  /* Deal stage Mapping*/
  const map = {
    appointmentscheduled: "Trial started",
    qualifiedtobuy: "Active trial user",
    closedwon: "Converted to paid subscription",
    closedlost: "Trial ended without conversion",
  };

  /* render as the component loads*/
  const hasFetched = useRef(false);
  const hasFetchedAccount = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAssociatedDeals();
      hasFetched.current = true;
    }
  }, []);

  /* fetch associated deals using backend server */
  const fetchAssociatedDeals = async () => {
    setLoading(true); // start loading
    setError(null); // reset errors

    try {
      const response = await fetch(
        `http://localhost:3001/api/contacts/${contact}/deals`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setDeals([...data.results].reverse());
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
          `https://app.hubspot.com/embed/${data.portalId}/0-1/${contact}`,
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
        View Subscription
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Subscription</Modal.Title>
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
                  <th>Deal name</th>
                  <th>Amount</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>{deal.properties.dealname}</td>
                    <td>{deal.properties.amount}</td>
                    <td>{map[deal.properties.dealstage] || "Unknown stage"}</td>
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

export default ViewAssociateDeals;
