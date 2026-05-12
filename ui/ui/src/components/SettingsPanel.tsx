import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Users,
  Lock,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { api } from '../services/api';

type CurrentUser = {
  u_id?: string;
  username: string;
  email?: string | null;
  role?: string;
  face_label?: string | null;
};

type ListedUser = {
  u_id: string;
  username: string;
  email?: string | null;
  role?: string;
};

type DeviceRecord = {
  device_id: string;
  d_name: string;
  type: string;
  state: string;
};

function formatRole(role?: string) {
  return String(role || 'user').toLowerCase() === 'admin' ? 'Admin' : 'User';
}

export function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meResponse = await api.getCurrentUser();
        const me = meResponse.data?.user || null;
        setCurrentUser(me);

        const devicesResponse = await api.getDevices();
        setDevices(devicesResponse.data?.devices || []);

        if (String(me?.role || '').toLowerCase() === 'admin') {
          const usersResponse = await api.getUsers();
          setUsers(usersResponse.data?.items || []);
        } else if (me) {
          setUsers(me ? [me] : []);
        }
      } catch (error) {
        console.error('Failed to load settings data:', error);
      }
    };

    fetchData();
  }, []);

  const onlineDevices = useMemo(
    () => devices.filter((device) => ['on', 'online', 'active', 'charging'].includes(String(device.state || '').toLowerCase())).length,
    [devices],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Settings</h1>
          <p className="text-muted-foreground">Manage your smart home preferences and configuration</p>
        </div>
        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
          <Shield className="mr-1 h-3 w-3" />
          {onlineDevices}/{devices.length} devices online
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-sm text-muted-foreground">Profile data is loaded from the current account.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input id="name" value={currentUser?.username || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={currentUser?.email || ''} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Members</CardTitle>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((member) => (
                  <div key={member.u_id || member.username} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-sm text-muted-foreground">{member.email || 'No email linked'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={formatRole(member.role) === 'Admin' ? 'default' : 'secondary'}>
                        {formatRole(member.role)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p>Account Role</p>
                    <p className="text-sm text-muted-foreground">Loaded from the authenticated user</p>
                  </div>
                </div>
                <Badge>{formatRole(currentUser?.role)}</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5" />
                  <div>
                    <p>Face Label</p>
                    <p className="text-sm text-muted-foreground">AI recognition identity stored in the database</p>
                  </div>
                </div>
                <Badge variant="outline">{currentUser?.face_label || 'Not set'}</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Auto-Lock Delay</Label>
                <Select defaultValue="5min">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1min">1 minute</SelectItem>
                    <SelectItem value="5min">5 minutes</SelectItem>
                    <SelectItem value="15min">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <p>Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Client-side preference for alert display</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">App Version</p>
                  <p>Smart Home Dashboard</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current User</p>
                  <p>{currentUser?.username || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connected Devices</p>
                  <p>{devices.length} devices</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Online Devices</p>
                  <p>{onlineDevices} devices</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button variant="outline">Check for Updates</Button>
                <Button variant="outline">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
