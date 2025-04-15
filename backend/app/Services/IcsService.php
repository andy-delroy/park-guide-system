namespace App\Services;

use Eluceo\iCal\Domain\Entity\Event;
use Eluceo\iCal\Domain\ValueObject\DateTime as ICalDateTime;
use Eluceo\iCal\Domain\ValueObject\TimeZone;
use Eluceo\iCal\Domain\Entity\Calendar;

use DateTimeImmutable;

class IcsService
{
    public function generateTrainingIcs($training)
    {
        $event = new Event();
        $event->setSummary($training->title);
        $event->setDescription($training->description ?? '');
        $event->setLocation($training->location);
        $event->setOccurrence(
            new \Eluceo\iCal\Domain\ValueObject\Occurrence(
                new ICalDateTime(new DateTimeImmutable($training->start_date)),
                new ICalDateTime(new DateTimeImmutable($training->end_date))
            )
        );

        $calendar = new Calendar([$event]);

        return $calendar->serialize();
    }
}
