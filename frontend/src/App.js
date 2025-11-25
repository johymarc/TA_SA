import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button"; //
import ContactList from "./ContactList.jsx";
import DealList from "./DealList.jsx";
import Chat from "./homepage.jsx";  
import "./App.css";

function App() {
  const [active, setActive] = useState("home"); /* controls main section */

  return (
    <>
      <div class="header-top">
        <h2>Admin Panel</h2>
      </div>

      <div class="bodyPanel">
        {/* Sidebar */}
        <aside style={{ width: 320 }}>
          <nav>
            {/* Home Page */}
            <Button
              variant="outline-primary"
              onClick={() => setActive("home")}
              style={{ cursor: "pointer" }}
            >
              Home
            </Button>

            {/* Customer Index */}
            <Button
              variant="outline-primary"
              onClick={() => {setActive("customers");}}
              style={{ cursor: "pointer" }}
            >
              Customers
            </Button>

            {/* Subscription (deals) Index */}
            <Button
              variant="outline-primary"
              onClick={() => {setActive("subscriptions");} }
              style={{ cursor: "pointer" }}
            >
              Subscriptions
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {active === "home" && <Chat /> }
          {active === "customers" && <ContactList />}
          {active === "subscriptions" && <DealList  />}
        </main>
      </div>
    </>
  );
}

export default App;
