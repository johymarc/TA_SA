require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');



const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory (for easy frontend development)
app.use(express.static(path.join(__dirname, 'public')));

// HubSpot API configuration
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Validate token on startup
if (!HUBSPOT_TOKEN) {
  console.error('❌ ERROR: HUBSPOT_ACCESS_TOKEN not found in .env file');
  console.error('Please create a .env file and add your HubSpot Private App token');
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in .env file');
  console.error('Please add your OpenAI API Key to the .env file');
  process.exit(1);
}

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

console.log("🤖 OpenAI client initialized successfully");


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});


// GET endpoint - Fetch Portal information
app.get('/api/account', async (req, res) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/integrations/v1/me`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Portal information:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch information',
      details: error.response?.data || error.message
    });
  }
});



// GET endpoint - Fetch contacts from HubSpot
app.get('/api/contacts', async (req, res) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 50,
          properties: 'firstname,lastname,email,phone,address,jobtitle,company'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching contacts:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch contacts',
      details: error.response?.data || error.message
    });
  }
});






// GET endpoint - Fetch contact from HubSpot
app.get('/api/contacts/:contactId/', async (req, res) => {
  try {

    const { contactId } = req.params;
    
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: 'firstname,lastname,email,phone,address,jobtitle,company'
        }
      }
    );
    res.json(response.data);
  } catch (error) {

    if (error.response?.status === 404) {
      return res.status(404).json({
        notFound: true,
        message: "Contact not found",
        suggestion: "Would you like to create a new contact?"
      });
    }

    console.error('Error fetching contact:', error.response?.data || error.message);

    console.error('Error fetching contact:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch contact',
      details: error.response?.data || error.message
    });
  }
});


// POST endpoint - Create new contact in HubSpot
app.post('/api/contacts', async (req, res) => {
  try {
    const response = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
      {
        properties: req.body.properties
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error creating contact:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create contact',
      details: error.response?.data || error.message
    });
  }
});




// GET endpoint - Fetch all deals from HubSpot
app.get('/api/deals', async (req, res) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 50,
          properties: 'dealname,amount,dealstage,closedate,pipeline'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching deals:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch deals',
      details: error.response?.data || error.message
    });
  }
});



// GET endpoint - Fetch deals from HubSpot
app.get('/api/deals/:dealId/', async (req, res) => {
  try {

    const { dealId } = req.params;
    
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/0-3/${dealId}/`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: 'dealname,amount,dealstage,closedate,pipeline'
        }
      }
    );
    res.json(response.data);
  } catch (error) {


    if (error.response?.status === 404) {
      return res.status(404).json({
        notFound: true,
        message: "Deal not found",
        suggestion: "Would you like to create a new deal?"
      });
    }

    console.error('Error fetching deal:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch deal',
      details: error.response?.data || error.message
    });
  }
});


// POST endpoint - Create new deal and associate to contact
app.post('/api/deals', async (req, res) => {
  try {
    const { dealProperties, contactId } = req.body;
    
    // Create the deal with association to contact
    const dealResponse = await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals`,
      {
        properties: dealProperties,
        associations: contactId ? [{
          to: { id: contactId },
          types: [{
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3 // Deal to Contact association
          }]
        }] : []
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(dealResponse.data);
  } catch (error) {
    console.error('Error creating deal:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create deal',
      details: error.response?.data || error.message
    });
  }
});

// GET endpoint - Fetch deals associated with a specific contact
app.get('/api/contacts/:contactId/deals', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // First, get the deal associations for this contact
    const associationsResponse = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/associations/deals`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // If there are associated deals, fetch their full details
    if (associationsResponse.data.results && associationsResponse.data.results.length > 0) {
      const dealIds = associationsResponse.data.results.map(r => r.id);
      
      const dealsResponse = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/objects/deals/batch/read`,
        {
          inputs: dealIds.map(id => ({ id })),
          properties: ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline']
        },
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(dealsResponse.data);
    } else {
      res.json({ results: [] });
    }
  } catch (error) {
    console.error('Error fetching deals for contact:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch deals for contact',
      details: error.response?.data || error.message
    });
  }
});


// GET endpoint - Fetch Contacts associated with a specific deal
app.get('/api/deals/:dealId/contacts', async (req, res) => {
  try {
    const { dealId } = req.params;
    
    // First, get the deal associations for this contact
    const associationsResponse = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/objects/deals/${dealId}/associations/contacts`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // If there are associated deals, fetch their full details
    if (associationsResponse.data.results && associationsResponse.data.results.length > 0) {
      const ContactIds = associationsResponse.data.results.map(r => r.id);
      
      const dealsResponse = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/batch/read`,
        {
          inputs: ContactIds.map(id => ({ id })),
          properties: ['firstname', 'lastname', 'email']
        },
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(dealsResponse.data);
    } else {
      res.json({ results: [] });
    }
  } catch (error) {
    console.error('Error fetching contact for deals:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch contact for deals',
      details: error.response?.data || error.message
    });
  }
});

// -------------------- AI intelligence ------------------


//------ Tools-----



const dealsTool = {
  type: "function",
  function: {
    name: "DealsTool",
    description: "Create, read, and manage deals in HubSpot-backed CRM with contact associations.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["createDeal", "getDealById", "getDealsByContact"],
          description: "Action to perform:\n" +
            "- createDeal: Create a new deal (requires dealProperties and optional contactId)\n" +
            "- getDealById: Fetch a specific deal (requires dealId)\n" +
            "- getDealsByContact: Get all deals associated with a contact (requires contactId)"
        },
        dealProperties: {
          type: "object",
          description: "Properties required to create a deal (only for createDeal action)",
          properties: {
            dealname: {
              type: "string",
              description: "Name of the deal"
            },
            amount: {
              type: "string",
              description: "Deal amount in currency"
            },
            dealstage: {
              type: "string",
              description: "Current stage of the deal",
              enum: ["appointmentscheduled", "qualifiedtobuy", "closedwon", "closedlost"]
            },
            closedate: {
              type: "string",
              description: "Expected close date (ISO format: YYYY-MM-DD, optional)"
            },
            pipeline: {
              type: "string",
              description: "Deal pipeline (optional, defaults to 'default')"
            }
          },
          required: ["dealname", "amount", "dealstage"]
        },
        contactId: {
          type: "string",
          description: "Contact ID to associate with the deal (optional for createDeal, required for getDealsByContact)"
        },
        dealId: {
          type: "string",
          description: "Deal ID for lookups (required for getDealById)"
        }
      },
      required: ["action"]
    }
  }
};

const contactsTool = {
  type: "function",
  function: {
    name: "ContactsTool",
    description: "Create, read, and manage contacts and their associations in HubSpot-backed CRM.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["createContact", "getContactById", "getAllContacts", "getContactAssociations"],
          description: "Action to perform:\n" +
            "- createContact: Create a new contact (requires contactProperties)\n" +
            "- getContactById: Fetch a specific contact (requires contactId)\n" +
            "- getAllContacts: Fetch all contacts in the system\n" +
            "- getContactAssociations: Get deals associated with a contact (requires contactId)"
        },
        contactProperties: {
          type: "object",
          description: "Properties required to create a contact (only for createContact action)",
          properties: {
            firstname: {
              type: "string",
              description: "Contact's first name"
            },
            lastname: {
              type: "string",
              description: "Contact's last name"
            },
            email: {
              type: "string",
              description: "Contact's email address"
            },
            phone: {
              type: "string",
              description: "Contact's phone number (optional)"
            },
            company: {
              type: "string",
              description: "Contact's company (optional)"
            },
            address: {
              type: "string",
              description: "Contact's address (optional)"
            },
            jobtitle: {
              type: "string",
              description: "Contact's job title (optional)"
            }
          },
          required: ["firstname", "lastname", "email"]
        },
        contactId: {
          type: "string",
          description: "Contact ID for lookups or associations (required for getContactById and getContactAssociations)"
        }
      },
      required: ["action"]
    }
  }
};


// -------- AI CHAT ENPOINT--------------------

app.post("/api/chat", async (req, res) => {
  try {
    const clientMessages = req.body.messages || [];

    // SYSTEM MESSAGE: E-commerce assistant
    const messages = [
      {
        role: "system",
        content:
          "You are an intelligent conversational assistant specialized in e-commerce operations, CRM workflows, and customer lifecycle management. Your role is to help users manage products, contacts, deals, subscriptions, and operational tasks commonly found in e-commerce and SaaS-enabled e-commerce businesses. You can answer questions, guide on best practices, retrieve data through available tools, or perform actions by calling tools whenever needed. You should always decide autonomously when a tool call is required. Responses must be clear, helpful, and practical, format any json in user friendle responses"
      },
      ...clientMessages
    ];

    // 1First model request: may trigger a tool call
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: [dealsTool, contactsTool],
      tool_choice: "auto"
    });

    const message = aiResponse.choices[0].message;

    //  If no tool call → return assistant text
    if (!message.tool_calls) {
      return res.json({ content: message.content });
    }

    // Handle tool call
    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    let toolResult;

    // -------------------- TOOL ROUTING ------------------
    if (toolName === "DealsTool") {
      if (args.action === "createDeal") {
        toolResult = await axios.post("http://localhost:3001/api/deals", {
          dealProperties: args.dealProperties,
          contactId: args.contactId
        });
      } else if (args.action === "getDealById") {
        toolResult = await axios.get(
          `http://localhost:3001/api/deals/${args.dealId}/`
        );
      } else if (args.action === "getDealsByContact") {
        toolResult = await axios.get(
          `http://localhost:3001/api/contacts/${args.contactId}/deals`
        );
      }
    }

    if (toolName === "ContactsTool") {
      if (args.action === "createContact") {
        toolResult = await axios.post("http://localhost:3001/api/contacts", {
          properties: args.contactProperties
        });
      } else if (args.action === "getContactById") {
        toolResult = await axios.get(
          `http://localhost:3001/api/contacts/${args.contactId}/`
        );
      } else if (args.action === "getAllContacts") {
        toolResult = await axios.get(
          `http://localhost:3001/api/contacts`
        );
      }else if (args.action === "getContactAssociations") {
        toolResult = await axios.get(
          `http://localhost:3001/api/contacts/${args.contactId}/deals`
        );
      }
    }

    // Send tool result back to model so it can talk to user
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult.data)
        }
      ]
    });

    const finalMessage = secondResponse.choices[0].message;

    res.json({ content: finalMessage.content });
  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "AI processing failed",
      details: err.response?.data || err.message
    });
  }
});




// -------------------- AI intelligence ------------------
// Start server
const server = app.listen(PORT, () => {
  console.log('\n✅ Server running successfully!');
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Static files served from: /public`);
  console.log('\n💡 Using hot-reload? Run: npm run dev');
  console.log('🛑 To stop server: Press Ctrl+C\n');
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}, closing server gracefully...`);
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
