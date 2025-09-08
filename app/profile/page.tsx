"use client"

import type React from "react"
import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Link,
  Unlink,
  Calendar,
  Clock,
  User,
  Activity,
  Settings,
  Utensils,
  Trophy,
  Heart,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface ExpandableCardProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ReactNode
}

function ExpandableCard({ title, children, defaultExpanded = false, icon }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-bg-surface border border-border-weak rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-raised transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-text-2">{icon}</div>}
          <h2 className="text-lg font-semibold text-text-1">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-text-2" />
        ) : (
          <ChevronRight className="h-5 w-5 text-text-2" />
        )}
      </button>
      {isExpanded && <div className="p-4 pt-0 border-t border-border-weak">{children}</div>}
    </div>
  )
}

export default function ProfilePage() {
  const [unitSystem, setUnitSystem] = useState("metric")
  const [menstrualTracking, setMenstrualTracking] = useState(false)
  const [cycleVaries, setCycleVaries] = useState(false)
  const [weeklyHours, setWeeklyHours] = useState([12])
  const [strengthSessions, setStrengthSessions] = useState([2])
  const [showTestDrawer, setShowTestDrawer] = useState(false)
  const [races, setRaces] = useState([
    { id: 1, date: "2024-12-15", name: "Ironman Barcelona", distance: "140.6", priority: "A", goalTime: "10:30:00" },
  ])
  const [personalRecords, setPersonalRecords] = useState([
    { sport: "swim", distance: "1km", time: "15:30", date: "2024-08-15" },
    { sport: "bike", distance: "20min power", value: "285W", date: "2024-09-01" },
    { sport: "run", distance: "10km", time: "42:15", date: "2024-08-20" },
  ])

  const addRace = () => {
    const newRace = {
      id: Date.now(),
      date: "",
      name: "",
      distance: "",
      priority: "B",
      goalTime: "",
    }
    setRaces([...races, newRace])
  }

  const removeRace = (id: number) => {
    setRaces(races.filter((race) => race.id !== id))
  }

  const addPersonalRecord = () => {
    const newPR = {
      sport: "swim",
      distance: "",
      time: "",
      date: new Date().toISOString().split("T")[0],
    }
    setPersonalRecords([...personalRecords, newPR])
  }

  const removePersonalRecord = (index: number) => {
    setPersonalRecords(personalRecords.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-bg-app pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-1 mb-2">Profile Settings</h1>
          <p className="text-text-2">Manage your personal information, training preferences, and equipment settings.</p>
        </div>

        <div className="space-y-6">
          <ExpandableCard title="Identity & Basics" defaultExpanded={true} icon={<User className="h-5 w-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Enter your full name" />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
              <div>
                <Label htmlFor="genderIdentity">Gender Identity</Label>
                <Input id="genderIdentity" placeholder="Enter your gender identity" />
              </div>
              <div>
                <Label htmlFor="sexAtBirth">Sex at Birth</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex at birth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="intersex">Intersex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Primary Location</Label>
                <Input id="location" placeholder="City, Country" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="Europe/London">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height">Height ({unitSystem === "metric" ? "cm" : "ft/in"})</Label>
                <Input id="height" placeholder={unitSystem === "metric" ? "175" : "5'9\""} />
              </div>
              <div>
                <Label htmlFor="weight">Weight ({unitSystem === "metric" ? "kg" : "lbs"})</Label>
                <Input id="weight" placeholder={unitSystem === "metric" ? "70" : "154"} />
              </div>
              <div className="md:col-span-2">
                <Label>Units</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="metric"
                      name="units"
                      value="metric"
                      checked={unitSystem === "metric"}
                      onChange={(e) => setUnitSystem(e.target.value)}
                      className="text-brand"
                    />
                    <Label htmlFor="metric">Metric</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="imperial"
                      name="units"
                      value="imperial"
                      checked={unitSystem === "imperial"}
                      onChange={(e) => setUnitSystem(e.target.value)}
                      className="text-brand"
                    />
                    <Label htmlFor="imperial">Imperial</Label>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Physiology & Health Context" icon={<Heart className="h-5 w-5" />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Resting HR Baseline</Label>
                  <div className="flex gap-2">
                    <Input value="52 bpm" readOnly className="bg-bg-raised" />
                    <Button variant="outline" size="sm">
                      Recalculate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>HRV Baseline</Label>
                  <div className="flex gap-2">
                    <Input value="45 ms" readOnly className="bg-bg-raised" />
                    <Button variant="outline" size="sm">
                      Recalculate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="typicalSleep">Typical Sleep (hours/night)</Label>
                  <Input id="typicalSleep" placeholder="7.5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="menstrualTracking">Menstrual Cycle Tracking</Label>
                  <Switch id="menstrualTracking" checked={menstrualTracking} onCheckedChange={setMenstrualTracking} />
                </div>

                {menstrualTracking && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-bg-raised rounded-lg">
                    <div>
                      <Label htmlFor="cycleLength">Usual Cycle Length (days)</Label>
                      <Input id="cycleLength" placeholder="28" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cycleVaries" checked={cycleVaries} onCheckedChange={setCycleVaries} />
                      <Label htmlFor="cycleVaries">Varies a lot</Label>
                    </div>
                    <div>
                      <Label htmlFor="currentPhase">Current Phase</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select phase" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="follicular">Follicular</SelectItem>
                          <SelectItem value="ovulatory">Ovulatory</SelectItem>
                          <SelectItem value="luteal">Luteal</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lastPeriod">First Day of Last Period</Label>
                      <Input id="lastPeriod" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="contraception">Contraception Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contraception" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="hormonal">Hormonal</SelectItem>
                          <SelectItem value="iud">IUD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="menopauseStatus">Menopause/Pregnancy Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular Cycles</SelectItem>
                          <SelectItem value="pregnant">Pregnant</SelectItem>
                          <SelectItem value="postpartum">Postpartum</SelectItem>
                          <SelectItem value="perimenopause">Perimenopause</SelectItem>
                          <SelectItem value="menopause">Menopause</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Recent Illness</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {["Flu/Covid", "GI Issues", "Upper Respiratory", "Other"].map((illness) => (
                    <div key={illness} className="flex items-center space-x-2">
                      <Checkbox id={illness.toLowerCase().replace(/\s+/g, "-")} />
                      <Label htmlFor={illness.toLowerCase().replace(/\s+/g, "-")}>{illness}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heatAcclimation">Heat Acclimatisation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select acclimatisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-acclimated">Not Acclimated</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="acclimated">Acclimated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="altitudeExposure">Altitude Exposure</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select altitude exposure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sea-level">Sea Level</SelectItem>
                      <SelectItem value="1-2km">1-2km</SelectItem>
                      <SelectItem value="2-3km">2-3km</SelectItem>
                      <SelectItem value="3km+">3km+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="medicalNotes">Medical Notes or Current Injuries</Label>
                <Textarea id="medicalNotes" placeholder="Describe any medical conditions, injuries, or concerns..." />
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Thresholds & Zones" icon={<Activity className="h-5 w-5" />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="css">Swim CSS (time per 100m)</Label>
                  <Input id="css" placeholder="1:25" />
                </div>
                <div>
                  <Label htmlFor="cssDate">Last CSS Test Date</Label>
                  <Input id="cssDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="ftp">Bike FTP (watts)</Label>
                  <Input id="ftp" placeholder="285" />
                </div>
                <div>
                  <Label htmlFor="ftpDate">Last FTP Test Date</Label>
                  <Input id="ftpDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="thresholdPace">Run Threshold Pace (time/km)</Label>
                  <Input id="thresholdPace" placeholder="4:15" />
                </div>
                <div>
                  <Label htmlFor="thresholdHR">Run Threshold HR (bpm)</Label>
                  <Input id="thresholdHR" placeholder="165" />
                </div>
                <div>
                  <Label htmlFor="vo2max">VO₂max (optional)</Label>
                  <Input id="vo2max" placeholder="55" />
                </div>
                <div>
                  <Label htmlFor="runTestDate">Last Run Test Date</Label>
                  <Input id="runTestDate" type="date" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setShowTestDrawer(true)} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Add Threshold Test Session
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  Manage Zones
                </Button>
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Availability & Load Preferences" icon={<Clock className="h-5 w-5" />}>
            <div className="space-y-6">
              <div>
                <Label>Target Weekly Hours: {weeklyHours[0]}h</Label>
                <Slider value={weeklyHours} onValueChange={setWeeklyHours} max={20} min={2} step={1} className="mt-2" />
              </div>

              <div>
                <Label>Preferred Training Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox id={day.toLowerCase()} />
                      <Label htmlFor={day.toLowerCase()}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="longestSession">Longest Session Cap (hours)</Label>
                  <Input id="longestSession" placeholder="3.5" />
                </div>
                <div>
                  <Label htmlFor="sessionsPerWeek">Sessions Per Week</Label>
                  <Input id="sessionsPerWeek" placeholder="6" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="brickSessions">Brick Sessions Allowed</Label>
                  <Switch id="brickSessions" />
                </div>

                <div>
                  <Label>Strength Sessions Per Week: {strengthSessions[0]}</Label>
                  <Slider
                    value={strengthSessions}
                    onValueChange={setStrengthSessions}
                    max={3}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="loadNotes">Load Preference Notes</Label>
                <Textarea id="loadNotes" placeholder="These values influence plan generation hour-band..." />
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Equipment & Data Sources" icon={<Settings className="h-5 w-5" />}>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-semibold text-text-1 mb-3">Equipment</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: "GPS Watch", status: true },
                    { name: "HR Strap", status: true },
                    { name: "Bike Power Meter", status: true },
                    { name: "Smart Trainer", status: false },
                    { name: "Footpod/Run Power", status: false },
                    { name: "Swim Device", status: true },
                  ].map((equipment) => (
                    <div key={equipment.name} className="flex items-center justify-between p-3 bg-bg-raised rounded-lg">
                      <Label htmlFor={equipment.name.toLowerCase().replace(/\s+/g, "-")}>{equipment.name}</Label>
                      <Switch
                        id={equipment.name.toLowerCase().replace(/\s+/g, "-")}
                        defaultChecked={equipment.status}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-text-1 mb-3">Integrations</h3>
                <div className="space-y-2">
                  {[
                    { name: "Garmin", connected: true, lastSync: "2 hours ago" },
                    { name: "Strava", connected: false, lastSync: null },
                    { name: "Apple Health", connected: true, lastSync: "1 hour ago" },
                    { name: "Polar", connected: false, lastSync: null },
                    { name: "Coros", connected: false, lastSync: null },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-3 bg-bg-raised rounded-lg"
                    >
                      <div>
                        <span className="text-text-1 font-medium">{integration.name}</span>
                        {integration.connected && integration.lastSync && (
                          <p className="text-sm text-text-2">Last sync: {integration.lastSync}</p>
                        )}
                      </div>
                      <Button
                        variant={integration.connected ? "destructive" : "default"}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {integration.connected ? (
                          <>
                            <Unlink className="h-4 w-4" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Fuelling Profile" icon={<Utensils className="h-5 w-5" />}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dietaryNotes">Dietary Notes/Allergies</Label>
                <Textarea
                  id="dietaryNotes"
                  placeholder="Describe any dietary restrictions, allergies, or preferences..."
                />
              </div>

              <div>
                <Label htmlFor="caffeineUse">Caffeine Use</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select caffeine use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sweatRate">Typical Sweat Rate (L/h)</Label>
                  <Input id="sweatRate" placeholder="1.2" />
                </div>
                <div>
                  <Label htmlFor="sweatSodium">Sweat Sodium Estimate (mg/L)</Label>
                  <Input id="sweatSodium" placeholder="800" />
                </div>
              </div>

              <div>
                <Label htmlFor="giTolerance">GI Tolerance Notes</Label>
                <Textarea
                  id="giTolerance"
                  placeholder="Describe any gastrointestinal sensitivities or tolerance issues..."
                />
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Races & Goals" icon={<Trophy className="h-5 w-5" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-text-1">Upcoming Races</h3>
                <Button onClick={addRace} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Race
                </Button>
              </div>

              {races.map((race) => (
                <div key={race.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-bg-raised rounded-lg">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" defaultValue={race.date} />
                  </div>
                  <div>
                    <Label>Event Name</Label>
                    <Input placeholder="Race name" defaultValue={race.name} />
                  </div>
                  <div>
                    <Label>Distance</Label>
                    <Input placeholder="Distance" defaultValue={race.distance} />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select defaultValue={race.priority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A Race</SelectItem>
                        <SelectItem value="B">B Race</SelectItem>
                        <SelectItem value="C">C Race</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Goal Time</Label>
                      <Input placeholder="HH:MM:SS" defaultValue={race.goalTime} />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeRace(race.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>

          <ExpandableCard title="Personal Records" icon={<Trophy className="h-5 w-5" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-text-1">Personal Bests</h3>
                <Button onClick={addPersonalRecord} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add PR
                </Button>
              </div>

              {personalRecords.map((pr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-bg-raised rounded-lg">
                  <div>
                    <Label>Sport</Label>
                    <Select defaultValue={pr.sport}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swim">Swim</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="run">Run</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Distance/Event</Label>
                    <Input placeholder="e.g., 1km, 20min power" defaultValue={pr.distance} />
                  </div>
                  <div>
                    <Label>Time/Value</Label>
                    <Input placeholder="e.g., 15:30, 285W" defaultValue={pr.time || pr.value} />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" defaultValue={pr.date} />
                  </div>
                  <div className="flex items-end">
                    <Button variant="destructive" size="sm" onClick={() => removePersonalRecord(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableCard>

          <ExpandableCard title="Subjective Baselines" icon={<Heart className="h-5 w-5" />}>
            <div className="space-y-4">
              <p className="text-sm text-text-2">These values are used when objective data are missing.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="typicalSoreness">Typical Soreness (1-5)</Label>
                  <Input id="typicalSoreness" placeholder="2" />
                </div>
                <div>
                  <Label htmlFor="typicalMood">Typical Mood (1-5)</Label>
                  <Input id="typicalMood" placeholder="4" />
                </div>
                <div>
                  <Label htmlFor="typicalSleepEfficiency">Typical Sleep Efficiency (%)</Label>
                  <Input id="typicalSleepEfficiency" placeholder="85" />
                </div>
              </div>
            </div>
          </ExpandableCard>

          <ExpandableCard title="Consent & Sharing" icon={<Shield className="h-5 w-5" />}>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shareWithCoach">Share Data with Coach/Club</Label>
                    <p className="text-sm text-text-2">Allow your coach or club to view your training data</p>
                  </div>
                  <Switch id="shareWithCoach" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymousResearch">Allow Anonymised Data for Research</Label>
                    <p className="text-sm text-text-2">Help improve training science with anonymised data</p>
                  </div>
                  <Switch id="anonymousResearch" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="performanceLeaderboard">Opt into Performance Leaderboard</Label>
                    <p className="text-sm text-text-2">Compare your performance with other athletes</p>
                  </div>
                  <Switch id="performanceLeaderboard" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border-weak">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Export Profile (JSON)
                </Button>
                <Button variant="destructive" disabled className="flex items-center gap-2">
                  Delete Account
                </Button>
              </div>
            </div>
          </ExpandableCard>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-weak p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button variant="outline">Cancel</Button>
          <div className="flex gap-4">
            <Button variant="outline">Recalculate Baselines</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>

      {showTestDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowTestDrawer(false)} />
          <div className="ml-auto w-96 bg-bg-app h-full shadow-xl animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-1">Add Threshold Test Session</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowTestDrawer(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="testType">Test Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="ftp">FTP</SelectItem>
                      <SelectItem value="threshold-pace">Threshold Pace</SelectItem>
                      <SelectItem value="ramp-test">Ramp Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="testDateTime">Date & Time</Label>
                  <Input id="testDateTime" type="datetime-local" />
                </div>

                <div>
                  <Label htmlFor="testNotes">Notes</Label>
                  <Textarea id="testNotes" placeholder="Add any notes about the test..." />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setShowTestDrawer(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowTestDrawer(false)} className="flex-1">
                  Schedule Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
