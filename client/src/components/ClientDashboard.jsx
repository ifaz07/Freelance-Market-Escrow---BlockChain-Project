import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function ClientDashboard({ contract, account }) {
  const [form, setForm] = useState({ title: "", category: "Dev", budget: "", date: "" });
  const [myJobs, setMyJobs] = useState([]);

  // Fetch jobs posted by this client
  const loadMyJobs = async () => {
    const count = await contract.jobCounter();
    let jobs = [];
    for (let i = 1; i <= Number(count); i++) {
      const job = await contract.jobs(i);
      if (job.client.toLowerCase() === account.toLowerCase()) {
        const bidCount = await contract.getBidCount(i);
        // Fetch bids for this job
        let bids = [];
        for(let j=0; j<bidCount; j++) {
            const b = await contract.getBid(i, j);
            bids.push({ idx: j, freelancer: b.freelancer, amount: b.amount });
        }
        jobs.push({ id: i, title: job.title, status: Number(job.status), bids });
      }
    }
    setMyJobs(jobs);
  };

  useEffect(() => { loadMyJobs(); }, [contract]);

  const postJob = async () => {
    const deadline = Math.floor(new Date(form.date).getTime() / 1000);
    const budgetWei = ethers.parseEther(form.budget);
    const tx = await contract.postJob(form.title, form.category, budgetWei, deadline);
    await tx.wait();
    loadMyJobs();
  };

  const hire = async (jobId, bidIndex, amount) => {
    const tx = await contract.hireFreelancer(jobId, bidIndex, { value: amount });
    await tx.wait();
    alert("Freelancer Hired! Funds locked in Escrow.");
    loadMyJobs();
  };

  const approve = async (jobId) => {
    const tx = await contract.approveWork(jobId);
    await tx.wait();
    alert("Work Approved! Funds released.");
    loadMyJobs();
  }

  return (
    <div>
      <h3>Post a New Job</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} />
        <select onChange={e => setForm({...form, category: e.target.value})}>
           <option>Dev</option><option>Design</option>
        </select>
        <input placeholder="Budget (ETH)" onChange={e => setForm({...form, budget: e.target.value})} />
        <input type="date" onChange={e => setForm({...form, date: e.target.value})} />
        <button onClick={postJob}>Post</button>
      </div>

      <h3>My Posted Jobs</h3>
      {myJobs.map(job => (
        <div key={job.id} style={{ border: "1px solid #ddd", padding: "10px", margin: "10px 0" }}>
          <h4>{job.title} (Status: {["Open", "InProgress", "Completed", "Closed", "Disputed"][job.status]})</h4>
          
          {/* Show Bids if Open */}
          {job.status === 0 && job.bids.map(bid => (
             <div key={bid.idx}>
                <span>Bid: {ethers.formatEther(bid.amount)} ETH </span>
                <button onClick={() => hire(job.id, bid.idx, bid.amount)}>Hire</button>
             </div>
          ))}

          {/* Show Approve Button if Completed */}
          {job.status === 2 && <button onClick={() => approve(job.id)}>Approve Work & Pay</button>}
        </div>
      ))}
    </div>
  );
}

