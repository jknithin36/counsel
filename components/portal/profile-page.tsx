"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { useDemoStore } from "@/lib/data/store";
import type { Client } from "@/lib/data/types";
import { CLIENT_ID, PortalPage } from "./shared";

export function ProfilePage() {
  const client = useDemoStore((s) =>
    s.clients.find((item) => item.id === CLIENT_ID),
  );
  const [values, setValues] = useState({
    email: "",
    phone: "",
    address: "",
    preferredContact: "email" as NonNullable<Client["preferredContact"]>,
    language: "English" as Client["language"],
    notificationEmail: true,
    notificationText: false,
  });
  useEffect(() => {
    if (client)
      setValues({
        email: client.email,
        phone: client.phone,
        address: client.address,
        preferredContact: client.preferredContact ?? "email",
        language: client.language,
        notificationEmail: client.notificationEmail ?? true,
        notificationText: client.notificationText ?? false,
      });
  }, [client]);
  if (!client)
    return (
      <PortalPage title="Profile">
        <p>Profile is not available.</p>
      </PortalPage>
    );
  const save = () => {
    useDemoStore.getState().mutate((data) => ({
      clients: data.clients.map((item) =>
        item.id === CLIENT_ID ? { ...item, ...values } : item,
      ),
      activityLog: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          type: "client_updated",
          actorId: "u-maria",
          message: "Maria Delgado updated her portal profile",
          href: `/dashboard/clients/${CLIENT_ID}`,
        },
        ...data.activityLog,
      ],
    }));
    if (values.language === "Spanish")
      toast.add({
        title: "Profile saved",
        description: "Spanish portal labels are coming soon.",
        type: "success",
      });
    else toast.add({ title: "Profile saved", type: "success" });
  };
  return (
    <PortalPage
      title="Profile"
      description="Keep your contact details and preferences up to date."
    >
      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
          <CardDescription>
            Your legal team sees these updates immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={client.name} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={values.email}
              onChange={(event) =>
                setValues({ ...values, email: event.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={values.phone}
              onChange={(event) =>
                setValues({ ...values, phone: event.target.value })
              }
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="profile-address">Mailing address</Label>
            <Input
              id="profile-address"
              value={values.address}
              onChange={(event) =>
                setValues({ ...values, address: event.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Preferred contact</Label>
            <Select
              value={values.preferredContact}
              onValueChange={(value) =>
                setValues({
                  ...values,
                  preferredContact: value as NonNullable<
                    Client["preferredContact"]
                  >,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <Select
              value={values.language}
              onValueChange={(value) =>
                setValues({ ...values, language: value as Client["language"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={save}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="flex min-h-12 items-center justify-between gap-4 rounded-lg border p-3">
            Email updates
            <Switch
              checked={values.notificationEmail}
              onCheckedChange={(checked) =>
                setValues({ ...values, notificationEmail: checked })
              }
            />
          </Label>
          <Label className="flex min-h-12 items-center justify-between gap-4 rounded-lg border p-3">
            Text updates
            <Switch
              checked={values.notificationText}
              onCheckedChange={(checked) =>
                setValues({ ...values, notificationText: checked })
              }
            />
          </Label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Password changes are disabled in this demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                title: "Demo account",
                description: "Password changes aren't available in the demo.",
                type: "info",
              })
            }
          >
            Change password
          </Button>
        </CardContent>
      </Card>
    </PortalPage>
  );
}
