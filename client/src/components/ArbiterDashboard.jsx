import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function ArbiterDashboard({ contract }) {
  const [disputes, setDisputes] = useState([]);
  const [fees, setFees] = useState("0");

  const loadData = async () => {
     const f = await contract.availableFees();
     setFees(ethers.formatEther(f));

     const count = await contract.jobCounter();
     let d = [];
     for(let i=1; i<=Number(count); i++) {
        const job = await contract.jobs(i);
        if (Number(job.status) === 4) { // 4 = Disputed
            d.push({ id: i, title: job.title });
        }
     }
     setDisputes(d);
  };

  useEffect(() => { loadData(); }, [contract]);

  const resolve = async (id, payFreelancer) => {
      const tx = await contract.resolveDispute(id, payFreelancer);
      await tx.wait();
      loadData();
  };

  return (
    <div>
      <h3>Arbiter Panel</h3>
      <p>Total Fees Collected: {fees} ETH</p>
      <h4>Active Disputes</h4>
      {disputes.map(d => (
          <div key={d.id} style={{ border: "1px solid red", padding: "10px" }}>
              <p>Job #{d.id}: {d.title}</p>
              <button onClick={() => resolve(d.id, false)}>Refund Client</button>
              <button onClick={() => resolve(d.id, true)}>Pay Freelancer</button>
          </div>
      ))}
    </div>
  );
}