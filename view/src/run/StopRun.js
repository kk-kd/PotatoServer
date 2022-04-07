import { endRun, getCurrentUserActiveRuns } from "./../api/axios_wrapper";

export const StopRun = () => {
  const getCurrentRun = async () => {
    try {
      console.log("getting current run")
      const activeRuns = await getCurrentUserActiveRuns();
      console.log(activeRuns);
      if (activeRuns.data.runs.length === 0) {
        alert("You do not currently have any active runs");
        return;
      } else {
        console.log("confirming");
        var doIt = window.confirm("Do you want to stop your current run?");
        console.log(doIt);
        if (doIt) {
          console.log("ending");
          activeRuns.data.runs.forEach(async (run) => {
            console.log(run.uid);
            const thing = await endRun(run.uid);
            console.log(thing);
          })
        }
      }
    } catch (e) {
      console.log(e.response.data);
    }
  }
  return (
      <button
          type="button"
          class="btn btn-outline-primary"
          id="selectable"
          onClick={() => getCurrentRun()}
      >Stop Run
      </button>
  )
}