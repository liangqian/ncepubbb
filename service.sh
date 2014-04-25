#!/bin/bash


start() {
    echo "==========Starting offchange: "
    if [ -f /tmp/offchange.run ]; then
        echo "/tmp/offchange.run exists, maybe it's running."
        return 1
    fi
    cd /srv/offchange
    touch /tmp/offchange.run
    date=`date +%F-%H_%M_%S`
    forever start -l $date.forever.log -o .forever/$date.output.log -e .forever/$date.error.log app.js
    echo "==========Done"
    return 0
}

stop() {
    echo "==========Stopping offchange: "
    if [ -f /tmp/offchange.run ]; then
        rm /tmp/offchange.run
        forever stopall
        echo "==========Done"
        return 0
    else
        echo "/tmp/offchange.run doesn't exist, maybe it has stopped."
        return 2
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        forever list
        ;;
    restart)
        stop
        start
        ;;
    *)
        echo "Usage:  {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $?
