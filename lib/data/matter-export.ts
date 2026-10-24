import { format } from "date-fns";
import { downloadCsv } from "@/lib/csv";
import { feeTypeLabels, matterStatusLabels, practiceAreaLabel } from "./labels";
import { userName } from "./selectors";
import { stageLabel } from "./stages";
import type { Client, Matter } from "./types";

/** Downloads a one-matter summary as CSV (field, value rows). */
export function downloadMatterCsv(matter: Matter, client?: Client) {
  const rows: [string, string][] = [
    ["Matter", matter.id],
    ["Title", matter.title],
    ["Client", client?.name ?? ""],
    ["Practice area", practiceAreaLabel(matter.practiceArea)],
    ["Status", matterStatusLabels[matter.status]],
    ["Stage", stageLabel(matter.practiceArea, matter.stage)],
    ["Lead attorney", userName(matter.leadAttorneyId)],
    ["Team", matter.team.map(userName).join("; ")],
    ["Fee type", feeTypeLabels[matter.feeType]],
    ["Opened", format(new Date(matter.openedAt), "yyyy-MM-dd")],
    [
      "Next deadline",
      matter.nextDeadline
        ? `${format(new Date(matter.nextDeadline.date), "yyyy-MM-dd")} ${matter.nextDeadline.label}`
        : "",
    ],
    ["Opposing parties", matter.opposingParties.join("; ")],
  ];
  downloadCsv(`${matter.id}.csv`, [["Field", "Value"], ...rows]);
}
