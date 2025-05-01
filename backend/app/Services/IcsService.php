<?php

namespace App\Services;

use Eluceo\iCal\Domain\Entity\Calendar;
use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\ValueObject\UniqueIdentifier;
use Eluceo\iCal\Domain\ValueObject\DateTime as ICalDateTime;
use Eluceo\iCal\Domain\ValueObject\Location;
use Eluceo\iCal\Domain\ValueObject\TimeSpan;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Illuminate\Support\Str;

class IcsService
{
    public function generateBulkTrainingIcs($trainings)
    {
        $calendar = new Calendar([]);

        foreach ($trainings as $training) {
            $event = new Event(new UniqueIdentifier(Str::uuid()->toString()));
            $event->setSummary($training->title);
            $event->setDescription($training->description ?? '');
            $event->setLocation(new Location($training->location ?? ''));
            $event->setOccurrence(
                new TimeSpan(
                    new ICalDateTime(new \DateTimeImmutable($training->start_date), true),
                    new ICalDateTime(new \DateTimeImmutable($training->end_date), true)
                )
            );
            $calendar->addEvent($event);
        }

        $calendarFactory = new CalendarFactory();
        return $calendarFactory->createCalendar($calendar);
    }
}
