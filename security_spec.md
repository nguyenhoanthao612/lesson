# IC3 GS6 Teaching Platform - Security Specification

This document details the security model, authorization invariants, and the adversarial testing specification to secure the Firestore layer against identity theft, malicious updates, or resource poisoning.

## 1. Zero-Trust Data Invariants

*   **Educator Integrity**: Only the authenticated teacher can create, write, modify, or delete lessons and classroom resources. Anonymous users or unauthenticated clients have zero permissions to read or write.
*   **Immutable Ownership**: The `authorId` and `authorEmail` fields inside any lesson must match the verified user credentials of the requesting client and cannot be hijacked or transferred after document registration.
*   **Creation Timestamps**: The `createdAt` and `updatedAt` properties must correspond strictly to the secure environment variable `request.time` to prevent retrospective forgery of historic lessons.
*   **Topic & Tag Limits**: Standard fields (such as `title` and `description`) must be protected by explicit type checking and length boundaries to safeguard the database against denial-of-wallet payload attacks.

---

## 2. The "Dirty Dozen" Threat Payloads

The rules are designed to strictly reject and terminate the following 12 bypass payloads under `PERMISSION_DENIED`:

### Identity Hijacking (Spoofing)
1. **The Ghost Author Profile**: Creating a lesson where the client-provided `authorId` is hardcoded to a high-privileged administrator (`"root-admin-uid"`) while the active session token UID belongs to an standard account.
2. **The Swapped ownership payload**: Attempting to update a lesson owned by `"teacher-jane"` with a payload that unilaterally sets `authorId` to `"teacher-john"`.

### Privilege Escalation
3. **The Administrator Claim Injector**: Attempting to register or modify a user profile containing a custom parameter block `isAdmin: true` to bypass general teacher gating.
4. **The Verified Claims Bypass**: Initiating a write operation from an email address matching the teacher but where `request.auth.token.email_verified == false`.

### State Shortcutting & Integrity
5. **The Retro Tempus Forgery**: Creating a lesson setting `createdAt` to dynamic past epochs (e.g. `946684800` representing year 2000) rather than standard server time.
6. **The Immutable Key Overwrite**: Attempting to modify the primary `createdAt` field of an existing lesson during an update operation.

### Resource Poisoning & Denial-Of-Wallet
7. **The Megabyte Overflow Attack**: Attempting to write a lesson where the `title` or `description` contains a 10MB structured string designed to rapidly exhaust memory buffers.
8. **The Malicious ID Poisoning**: Trying to create a file resource with document path ID `/resources/../hacked-subsystem` inside the route parameter string.
9. **The Unbounded Array Explosion**: Injecting an array of 5,000 sub-items into a content block to disrupt normal clients during layout parsing.

### Information Gathering & Leaks
10. **The Anonymous Scraping Sweep**: Conducting database listings on `/lessons` or `/resources` as an anonymous client.
11. **The Blind Query Injection**: Requesting list views without supplying categorical filtering, relying on client-side state filters instead.
12. **The Corrupted File Upload Reference**: Injecting a custom resource with anomalous MIME types (e.g., `.exe` masquerading as a student manual `.pdf`) or containing negative timestamps.

---

## 3. Authorization Blueprint (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global safety catch-all
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Core helper primitives
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isVerifiedUser() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }
    
    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }
    
    // Schema validator for lessons
    function isValidLesson(data) {
      return data.id is string
        && data.id.size() <= 128
        && data.title is string
        && data.title.size() >= 1
        && data.title.size() <= 200
        && data.description is string
        && data.description.size() <= 2000
        && data.category is string
        && (data.category == 'Computing Fundamentals' || data.category == 'Key Applications' || data.category == 'Living Online')
        && data.topic is string
        && data.topic.size() <= 200
        && data.authorId == request.auth.uid;
    }
    
    // Schema validator for file resources
    function isValidResource(data) {
      return data.id is string
        && data.id.size() <= 128
        && data.title is string
        && data.title.size() >= 1
        && data.title.size() <= 200
        && data.fileName is string
        && data.fileName.size() <= 500
        && data.fileUrl is string
        && data.fileUrl.size() <= 2000
        && data.fileType is string
        && (data.fileType == 'image' || data.fileType == 'pdf' || data.fileType == 'video' || data.fileType == 'other')
        && data.category is string
        && (data.category == 'Computing Fundamentals' || data.category == 'Key Applications' || data.category == 'Living Online');
    }

    match /lessons/{lessonId} {
      allow get: if isVerifiedUser();
      allow list: if isVerifiedUser();
      
      allow create: if isVerifiedUser() 
        && isValidId(lessonId) 
        && isValidLesson(request.resource.data)
        && request.resource.data.createdAt == request.time;
        
      allow update: if isVerifiedUser()
        && isValidId(lessonId)
        && isValidLesson(request.resource.data)
        && request.resource.data.authorId == resource.data.authorId
        && request.resource.data.createdAt == resource.data.createdAt
        && request.resource.data.updatedAt == request.time;
        
      allow delete: if isVerifiedUser()
        && resource.data.authorId == request.auth.uid;
    }

    match /resources/{resourceId} {
      allow get: if isVerifiedUser();
      allow list: if isVerifiedUser();
      
      allow create: if isVerifiedUser()
        && isValidId(resourceId)
        && isValidResource(request.resource.data)
        && request.resource.data.createdAt == request.time;
        
      allow update: if isVerifiedUser()
        && isValidId(resourceId)
        && isValidResource(request.resource.data)
        && request.resource.data.createdAt == resource.data.createdAt;
        
      allow delete: if isVerifiedUser();
    }
  }
}
```
