"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { storage, type User } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExcelImportExport } from "@/components/excel-import-export"
import { Toaster } from "@/components/ui/toaster"

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "Sales" as "Admin" | "Sales" | "Inventory Manager",
  })

  useEffect(() => {
    setCurrentUser(getCurrentUser())
    setUsers(storage.getUsers())
  }, [])

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    storage.createUser({
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString(),
    })
    setNewUser({ username: "", password: "", fullName: "", role: "Sales" })
    setUsers(storage.getUsers())
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage system settings and user accounts</p>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{currentUser.fullName}</div>
                    <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
                  </div>
                  <Badge>{currentUser.role}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ExcelImportExport />

        {/* User Management - Admin Only */}
        {currentUser?.role === "Admin" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      >
                        <option value="Sales">Sales</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit">Add User</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell className="font-mono">@{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
