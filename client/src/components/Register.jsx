import { useState } from "react";

export default function Register({ contract, onSuccess }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("1"); // Default Client

  const register = async () => {
    try {
      const tx = await contract.registerUser(name, parseInt(role));
      await tx.wait();
      alert("Registration Successful!");
      onSuccess(); // Refresh App to show dashboard
    } catch (err) {
  	console.error("FULL ERROR OBJECT:", err); // This prints the real details to the Console
  	alert("Transaction failed! Open the Console (F12) to see why.");
	}
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome! Please Register</h1>
      <input placeholder="Your Name" onChange={(e) => setName(e.target.value)} />
      <select onChange={(e) => setRole(e.target.value)}>
        <option value="1">Client</option>
        <option value="2">Freelancer</option>
      </select>
      <button onClick={register}>Register</button>
    </div>
  );
}
