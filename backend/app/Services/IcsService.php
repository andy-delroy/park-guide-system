<?php

namespace App\Services;

use Eluceo\iCal\Domain\Entity\Calendar;
use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\ValueObject\DateTime as IcalDateTime;
use Eluceo\iCal\Domain\ValueObject\Description;
use Eluceo\iCal\Domain\ValueObject\Location;
use Eluceo\iCal\Domain\ValueObject\Summary;
use Eluceo\iCal\Domain\ValueObject\UniqueIdentifier;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class IcsService
{
    //Generate ICS content for multiple trainings (bulk download)

    public function generateBulkTrainingIcs(Collection $trainings)
    {
        $events = [];

        foreach ($trainings as $training) {
            $event = new Event(
                new UniqueIdentifier('training-' . $training->id), 
                new Summary($training->title),
                new Description($training->description ?? ''),
                new IcalDateTime(new \DateTime($training->start_date)),
                new IcalDateTime(new \DateTime($training->end_date))
            );

            if ($training->location) {
                $event->setLocation(new Location($training->location));
            }

            $events[] = $event;
        }

        $calendar = new Calendar($events);
        $calendarFactory = new CalendarFactory();

        return $calendarFactory->createCalendar($calendar);
    }
}
