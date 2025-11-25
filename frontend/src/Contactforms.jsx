import { useState } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import CreateContactForm from "./CreateContactForm";

function Contactform() {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    window.location.reload();
  };
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        variant="outline-primary"
        onClick={handleShow}
        style={{ margin: "15px" }}
      >
        Create Contact
      </Button>

      <Offcanvas show={show} placement={"end"} onHide={handleClose}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <CreateContactForm />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Contactform;
