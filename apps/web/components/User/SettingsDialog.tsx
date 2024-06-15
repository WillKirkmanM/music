import { Button } from "@music/ui/components/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@music/ui/components/dialog"
import ChangeBitrate from "./ChangeBitrate"
import { ChangePassword } from "./ChangePassword"
import Username from "./Username"

export default function SettingsDialog() {
 return (
    <DialogContent className="text-black overflow-x-auto">
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Make yourself at home. Change your username, password, or even the audio quality.
      </DialogDescription>
    </DialogHeader>

    <Username />
    <ChangePassword />
    <ChangeBitrate />

  </DialogContent>
 )
}