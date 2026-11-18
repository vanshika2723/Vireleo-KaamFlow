
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Star,
  MessageSquare,
  TrendingUp
} from "lucide-react";

const followUps = [
  {
    id: "FL-001",
    customer: "Rahul Sharma",
    service: "Washing Machine Repair",
    date: "18 Nov 2026",
    outcome: "Working as Expected",
    rating: 5,
    status: "Responded"
  },
  {
    id: "FL-002",
    customer: "Priya Verma",
    service: "Microwave Repair",
    date: "17 Nov 2026",
    outcome: "Same Symptom Persists",
    rating: 2,
    status: "Responded"
  },
  {
    id: "FL-003",
    customer: "Amit Gupta",
    service: "Refrigerator Repair",
    date: "16 Nov 2026",
    outcome: "Partly Improved",
    rating: 3,
    status: "Responded"
  },
  {
    id: "FL-004",
    customer: "Neha Singh",
    service: "Air Conditioner Repair",
    date: "15 Nov 2026",
    outcome: "Unknown",
    rating: null,
    status: "No Response"
  },
  {
    id: "FL-005",
    customer: "Karan Mehta",
    service: "LED TV Repair",
    date: "14 Nov 2026",
    outcome: "Different Issue",
    rating: 3,
    status: "Responded"
  },
  {
    id: "FL-006",
    customer: "Sneha Jain",
    service: "Mixer Grinder Repair",
    date: "13 Nov 2026",
    outcome: "Unknown",
    rating: null,
    status: "Pending"
  }
];

const outcomeStyles = {
  "Working as Expected": "bg-emerald-50 text-emerald-700",
  "Same Symptom Persists": "bg-rose-50 text-rose-700",
  "Partly Improved": "bg-amber-50 text-amber-700",
  "Different Issue": "bg-blue-50 text-blue-700",
  Unknown: "bg-slate-100 text-slate-600"
};

function FixLoop() {
  const responded = followUps.filter(
    (item) => item.status === "Responded"
  ).length;

  const noResponse = followUps.filter(
    (item) => item.status === "No Response"
  ).length;

  const pending = followUps.filter(
    (item) => item.status === "Pending"
  ).length;

  const comebacks = followUps.filter(
    (item) => item.outcome === "Same Symptom Persists"
  ).length;

  const comebackRate = responded
    ? Math.round((comebacks / responded) * 100)
    : 0;

  const ratedItems = followUps.filter((item) => item.rating !== null);
  const averageRating = ratedItems.length
    ? (
        ratedItems.reduce((sum, item) => sum + item.rating, 0) /
        ratedItems.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <RefreshCw size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              FixLoop Outcomes
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Track post-repair customer feedback and identify recurring issues
          </p>
        </div>

        <span className="w-fit rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700">
          Outcome Intelligence
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Follow-ups</p>
            <MessageSquare className="text-violet-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {followUps.length}
          </h2>
          <p className="mt-1 text-xs text-slate-400">Customer follow-up records</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Responses Received</p>
            <CheckCircle2 className="text-emerald-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {responded}
          </h2>
          <p className="mt-1 text-xs text-emerald-600">Customer responses</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Comeback Rate</p>
            <AlertTriangle className="text-rose-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {comebackRate}%
          </h2>
          <p className="mt-1 text-xs text-rose-600">
            Same symptom persists among responses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Average Rating</p>
            <Star className="text-amber-500" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {averageRating} / 5
          </h2>
          <p className="mt-1 text-xs text-slate-400">Customer satisfaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="text-amber-500" size={19} />
            <h3 className="font-semibold text-slate-700">Pending Follow-ups</h3>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">{pending}</p>
          <p className="mt-1 text-xs text-slate-400">
            Awaiting customer feedback
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-rose-500" size={19} />
            <h3 className="font-semibold text-slate-700">No Response</h3>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">{noResponse}</p>
          <p className="mt-1 text-xs text-slate-400">
            Follow-ups without a response
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-violet-600" size={19} />
            <h3 className="font-semibold text-slate-700">Comeback Cases</h3>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">{comebacks}</p>
          <p className="mt-1 text-xs text-slate-400">
            Same symptom reported again
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Customer Outcomes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Post-repair follow-up history
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search follow-ups..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-4 font-semibold">Follow-up ID</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Service</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Outcome</th>
                <th className="px-4 py-4 font-semibold">Rating</th>
                <th className="px-4 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {followUps.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-violet-700">
                    {item.id}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-700">
                    {item.customer}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {item.service}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {item.date}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${outcomeStyles[item.outcome]}`}
                    >
                      {item.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {item.rating !== null ? (
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Star size={15} className="fill-amber-400 text-amber-400" />
                        {item.rating}/5
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        item.status === "Responded"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl bg-violet-50 p-4 text-sm text-violet-700">
          FixLoop helps identify repeat failures, customer satisfaction and
          repair quality after service completion.
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Sample dashboard data — backend FixLoop API integration will be done later.
      </p>
    </div>
  );
}

export default FixLoop;
