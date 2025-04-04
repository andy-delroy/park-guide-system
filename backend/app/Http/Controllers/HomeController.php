<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\PublicEvent;

class NotificationController extends Controller
{
    public function send(Request $request)
    {
        $title = $request->input('title', '🔔 Default Title');
        $message = $request->input('message', 'This is a test message from controller.');

        broadcast(new PublicEvent($title, $message))->toOthers();

        return response()->json(['status' => '✅ Broadcast sent!']);
    }
}
