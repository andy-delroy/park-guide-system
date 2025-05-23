<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

//to harry: it is for notification mobile.
Broadcast::channel('notifications.{role}', function ($user, $role) {
    return $user->role_name === $role || $user->role_name === 'admin';
});

Broadcast::channel('all_channels', function ($user) {
    return true; // Allow all authenticated users to listen to all_channels
});