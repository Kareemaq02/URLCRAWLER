package crawler

import (
	"context"
	"sync"
)

var activeTasks = sync.Map{} // map[int]context.CancelFunc

// Add URL to task list
func RegisterTask(urlID int, cancel context.CancelFunc) {
	activeTasks.Store(urlID, cancel)
}

// Remove URL from task list
func UnregisterTask(urlID int) {
	activeTasks.Delete(urlID)
}

// Get URL from task list
func GetTask(urlID int) (context.CancelFunc, bool) {
	val, ok := activeTasks.Load(urlID)
	if !ok {
		return nil, false
	}
	cancelFunc, ok := val.(context.CancelFunc)
	return cancelFunc, ok
}

// Cancel a running URL process
func CancelTask(urlID int) bool {
	val, ok := activeTasks.Load(urlID)
	if ok {
		cancel := val.(context.CancelFunc)
		cancel()
		activeTasks.Delete(urlID)
		return true
	}
	return false
}
