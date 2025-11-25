import { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button"; //
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Dealform from "./Dealform";
import ViewAssociatecontact from "./modalViewAssociatedContact";

function DealList() {
  /* Deal stage Mapping*/
  const map = {
    appointmentscheduled: "Trial started",
    qualifiedtobuy: "Active trial user",
    closedwon: "Converted to paid subscription",
    closedlost: "Trial ended without conversion",
  };

  const [deals, setdeals] = useState([]); /* state to control main section */
  const [loading, setLoading] = useState(true); /* For loading state */
  const [error, setError] = useState(null); /* Errro handle */

  /* render as the component loads*/
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      fetchDeals();
      hasFetched.current = true;
    }
  }, []);

  /* fetch Deal using backend server */
  const fetchDeals = async () => {
    setLoading(true); // start loading
    setError(null); // reset errors

    try {
      const response = await fetch("http://localhost:3001/api/deals");

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setdeals([...data.results].reverse());
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
        <h1 style={{ padding: "15px" }}>Subscriptions</h1>
        <Dealform />
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
              <th>Deal name</th>
              <th>Amount</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td>
                  {" "}
                  <ViewAssociatecontact deal={deal.id} />
                </td>
                <td>{deal.properties.dealname}</td>
                <td>{deal.properties.amount}</td>
                <td>{map[deal.properties.dealstage] || "Unknown stage"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default DealList;
