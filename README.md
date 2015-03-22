# angular2-example-isomorphic
WIP: isomorphic angular2
Refactor component serializer

## Build

```bash
$ npm install
$ gulp
$ nodemon
```

## Debug
```bash
$ npm run debug
```

## Todo:
* ~~get Compiler working~~
* ~~serialize the component~~
* refactor component serializer
* get new router working on the server
* structure app to manage the same state
* have the app work without javascript


one idea
```txt
+--------------------------------+
| Build System                   |
|   \                            |
|     +-----------------------+  |
|     | Environments          |  |
|     |  \ Web                |  |
|     |  \ Server             |  |
|     |  \ Desktop            |  |
|     |        \              |  |
|     |        \ +---------+  |  |
|     |        \ |  IsoApp |  |  |
|     |          +---------+  |  |
|     +-----------------------+  |
|                                |
+--------------------------------+
```
another idea

```txt
          +--------------------+            
          |                    |            
          |    Build System    |            
          |                    |            
          +----------+---------+            
                     |                      
                     |                      
+--------------------v--------------------+ 
|                                         | 
|         JSONG App Dependencies          | 
|                                         | 
+--------------------+--------------------+ 
                     |                      
                     |                      
      +---------Environments--------+       
      |              |              |       
+-----v-----+  +-----v-----+  +-----v-----+ 
|           |  |           |  |           | 
|    Web    |  |  Server   |  |  Desktop  | 
|           |  |           |  |           | 
+-----+-----+  +-----+-----+  +-----+-----+ 
      |              |              |       
      +-----------------------------+       
                     |                      
                     |                      
+--------------------+--------------------+ 
|                                         | 
|                   API                   | 
|                                         | 
+--------------------+--------------------+ 
                     |                      
+--------------------|--------------------+ 
|                    v                    | 
|              Isomorphic App             | 
| +-------------------------------------+ | 
| |                                     | | 
| |       JSONG App Dependencies        | | 
| |                                     | | 
| +------------------v------------------+ | 
|                    |                    | 
|       +----------Layout----------+      | 
|       |            |             |      | 
|       |            |             |      | 
|  +----+------+     |      +------+----+ | 
|  | Component |     |      | Component | | 
|  | Containers|     |      | Containers| | 
|  +----+------+     |      +------+----+ | 
|       |            |             |      | 
|       |      +-----+------+      |      | 
|       |      | Component  |      |      | 
|       |      | Containers |      |      | 
|       |      +-----+------+      |      | 
|       |            |             |      | 
|       |            |             |      | 
|       |            |             |      | 
|       +------------v-------------+      | 
|                    |                    | 
|                    |                    | 
+--------------------v--------------------+ 
                     |                      
     +-------------Client-----------+       
     |               |              |       
+----v-----+   +-----v-----+  +-----v-----+ 
|          |   |           |  |           | 
|   Web    |   |  Server   |  |  Desktop  | 
|          |   |           |  |           | 
+----+-----+   +-----------+  +-----+-----+ 
     |               |              |       
     +---------------+--------------+       
                     |                      
                     |                      
           +---------+----------+
           |                    |
           |        API         |
           |                    |
           +--------------------+
    
```
