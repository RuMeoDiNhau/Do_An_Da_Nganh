import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Wifi, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Home,
  Users,
  Lock,
  Eye,
  HelpCircle,
  Lightbulb,
  Wind
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [lightOn, setLightOn] = useState(true);
  const [fanOn, setFanOn] = useState(false);

  const familyMembers = [
    { name: 'Khang', role: 'Admin', avatar: null, access: 'Full Access' },
    { name: 'Lan', role: 'User', avatar: null, access: 'Standard Access' },
    { name: 'Faker', role: 'Guest', avatar: null, access: 'Limited Access' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Settings</h1>
          <p className="text-muted-foreground">Manage your smart home preferences and configuration</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          All Systems Secure
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Profile Settings */}
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
                  <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Home Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Home Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="home-name">Home Name</Label>
                  <Input id="home-name" placeholder="My Smart Home" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="123 Main St, City, State" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Family Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Family Members</CardTitle>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.access}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p>Guest Access</p>
                    <p className="text-sm text-muted-foreground">Allow temporary access for visitors</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p>Remote Access</p>
                    <p className="text-sm text-muted-foreground">Control your home from anywhere</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p>Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5" />
                  <div>
                    <p>Camera Recording</p>
                    <p className="text-sm text-muted-foreground">Allow security cameras to record</p>
                  </div>
                </div>
                <Switch defaultChecked />
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
              
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Security Audit
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Usage Analytics</p>
                  <p className="text-sm text-muted-foreground">Help improve our services</p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p>Data Sharing</p>
                  <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                </div>
                <Switch />
              </div>
              
              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
            </CardContent>
          </Card>

          {/* Network Settings moved to Security or kept hidden depending on preference. Added back as you might want it here or gone. Assuming you wanted it gone with Devices tab based on your prompt, but if needed, you can move the Network Card here. */}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
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
                    <p className="text-sm text-muted-foreground">Receive alerts on your devices</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4>Alert Types</h4>
                {[
                  { name: 'Security Alerts', description: 'Door locks, cameras, alarms', enabled: true },
                  { name: 'Energy Notifications', description: 'Usage reports, peak hours', enabled: true },
                  { name: 'Device Status', description: 'Connection issues, low battery', enabled: true },
                  { name: 'System Updates', description: 'New features, maintenance', enabled: false },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p>{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Switch defaultChecked={alert.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Enable Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">Reduce notifications during specified times</p>
                </div>
                <Switch />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" defaultValue="22:00" />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" defaultValue="07:00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">App Version</p>
                  <p>Smart Home Dashboard v2.1.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hub Firmware</p>
                  <p>v1.8.3 (Latest)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p>October 1, 2024</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connected Devices</p>
                  <p>24 devices</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-4">
                <Button variant="outline">
                  Check for Updates
                </Button>
                <Button variant="outline">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Legal & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                Privacy Policy
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Terms of Service
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                License Information
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}