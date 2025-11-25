import { useState } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import CreateDealForm from "./CreateDealForm";

function Dealform() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        variant="outline-primary"
        onClick={handleShow}
        style={{ margin: "15px" }}
      >
        Create Deal
      </Button>

      <Offcanvas show={show} placement={"end"} onHide={handleClose}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <CreateDealForm />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Dealform;
