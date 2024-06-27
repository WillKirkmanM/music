import { Button } from "@music/ui/components/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@music/ui/components/dialog";
import ChangeBitrate from "./ChangeBitrate";
import { ChangePassword } from "./ChangePassword";
import Username from "./Username";
import { RevalidateAll, RevalidateTag } from "@/actions/Caching/Revalidate";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@music/ui/components/tabs";

export default function SettingsDialog() {
  return (
    <DialogContent className="text-black overflow-x-auto">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Make yourself at home. Change your username, password, or even the
          audio quality.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Username />
          <ChangePassword />
        </TabsContent>

        <TabsContent value="audio">
          <ChangeBitrate />
        </TabsContent>

        <TabsContent value="cache">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={RevalidateAll}>
                <Button type="submit">Everything</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form
                onSubmit={() => {
                  RevalidateTag("landing-carousel");
                  RevalidateTag("landing-carousel-songs");
                }}
              >
                <Button type="submit">Landing Album</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={() => RevalidateTag("landing-carousel-songs")}>
                <Button type="submit">Landing Album Songs</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={() => RevalidateTag("listen-history")}>
                <Button type="submit">Listen History</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={() => RevalidateTag("from-your-library")}>
                <Button type="submit">From Your Library</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={() => RevalidateTag("random-songs")}>
                <Button type="submit">Random Songs</Button>
              </form>
            </div>

            <div className="col-span-3 md:col-span-1 mb-4">
              <form onSubmit={() => RevalidateTag("recommended-albums")}>
                <Button type="submit">Recommended Albums</Button>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
