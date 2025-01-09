function droidLimit(player)	// inside hackNetOff()
{
	setDroidLimit(player, 300, DROID_ANY);
	setDroidLimit(player, 10, DROID_COMMAND);
	setDroidLimit(player, 50, DROID_CONSTRUCT);
}
