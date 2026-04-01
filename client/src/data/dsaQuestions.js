// ── Top Company DSA Question Bank ──
// 10 Topics × 20 Questions = 200 curated questions
// Each: title, topic, company, year, difficulty, frequency (how often asked), hint

const COMPANIES = ['Google','Amazon','Microsoft','Meta','Apple','Netflix','Uber','Adobe','Goldman Sachs','Flipkart','Walmart','Infosys','TCS','Wipro','Paytm','PhonePe','Razorpay','Swiggy','Zomato','Atlassian']

const TOPICS = ['Arrays','Strings','Linked List','Trees','Graphs','Dynamic Programming','Stack & Queue','Sorting & Searching','Recursion & Backtracking','Hashing']

const DIFFICULTIES = ['Easy','Medium','Hard']

const questions = [
  // ══════════════════════════════════
  // ARRAYS (20)
  // ══════════════════════════════════
  { id:1, title:'Two Sum', topic:'Arrays', company:'Google', year:2025, difficulty:'Easy', frequency:98, hint:'Use a hash map to store complements.' },
  { id:2, title:'Stock Buy and Sell', topic:'Arrays', company:'Amazon', year:2024, difficulty:'Easy', frequency:95, hint:'Track min price so far, maximize profit.' },
  { id:3, title:'Container With Most Water', topic:'Arrays', company:'Meta', year:2025, difficulty:'Medium', frequency:88, hint:'Two pointers from both ends.' },
  { id:4, title:'3Sum', topic:'Arrays', company:'Microsoft', year:2025, difficulty:'Medium', frequency:90, hint:'Sort, then two pointers for each element.' },
  { id:5, title:'Product of Array Except Self', topic:'Arrays', company:'Apple', year:2024, difficulty:'Medium', frequency:85, hint:'Prefix and suffix product arrays.' },
  { id:6, title:'Maximum Subarray (Kadane\'s)', topic:'Arrays', company:'Google', year:2024, difficulty:'Medium', frequency:92, hint:'Kadane\'s algorithm — running sum.' },
  { id:7, title:'Merge Intervals', topic:'Arrays', company:'Amazon', year:2025, difficulty:'Medium', frequency:89, hint:'Sort by start, merge overlapping.' },
  { id:8, title:'Rotate Array', topic:'Arrays', company:'Microsoft', year:2025, difficulty:'Medium', frequency:78, hint:'Reverse entire, then reverse parts.' },
  { id:9, title:'Minimum Jumps', topic:'Arrays', company:'Uber', year:2024, difficulty:'Medium', frequency:82, hint:'Binary search on rotated array.' },
  { id:10, title:'Trapping Rain Water', topic:'Arrays', company:'Google', year:2024, difficulty:'Hard', frequency:91, hint:'Two pointer or stack approach.' },
  { id:11, title:'Next Permutation', topic:'Arrays', company:'Adobe', year:2025, difficulty:'Medium', frequency:80, hint:'Find rightmost ascending pair.' },
  { id:12, title:'Majority Element', topic:'Arrays', company:'Goldman Sachs', year:2025, difficulty:'Easy', frequency:75, hint:'Boyer–Moore voting algorithm.' },
  { id:13, title:'Subarray with given sum', topic:'Arrays', company:'Flipkart', year:2024, difficulty:'Medium', frequency:77, hint:'Use first row/col as markers.' },
  { id:14, title:'Subarray Sum Equals K', topic:'Arrays', company:'Meta', year:2024, difficulty:'Medium', frequency:86, hint:'Prefix sum + hashmap.' },
  { id:15, title:'Minimize the Heights II', topic:'Arrays', company:'Amazon', year:2025, difficulty:'Medium', frequency:79, hint:'Layer by layer traversal.' },
  { id:16, title:'Jump Game', topic:'Arrays', company:'Google', year:2025, difficulty:'Medium', frequency:83, hint:'Greedy — track farthest reachable.' },
  { id:17, title:'Missing number in array', topic:'Arrays', company:'Microsoft', year:2024, difficulty:'Hard', frequency:76, hint:'Cyclic sort in-place.' },
  { id:18, title:'Sliding Window Maximum', topic:'Arrays', company:'Uber', year:2024, difficulty:'Hard', frequency:84, hint:'Monotonic deque.' },
  { id:19, title:'Median of Two Sorted Arrays', topic:'Arrays', company:'Google', year:2025, difficulty:'Hard', frequency:88, hint:'Binary search on smaller array.' },
  { id:20, title:'Longest Consecutive Sequence', topic:'Arrays', company:'Amazon', year:2024, difficulty:'Medium', frequency:81, hint:'HashSet, check start of sequence.' },

  // ══════════════════════════════════
  // STRINGS (20)
  // ══════════════════════════════════
  { id:21, title:'Longest Substring Without Repeating Characters', topic:'Strings', company:'Amazon', year:2025, difficulty:'Medium', frequency:94, hint:'Sliding window + set.' },
  { id:22, title:'Parenthesis Checker', topic:'Strings', company:'Google', year:2024, difficulty:'Easy', frequency:92, hint:'Stack — push open, match close.' },
  { id:23, title:'Longest Palindromic Substring', topic:'Strings', company:'Microsoft', year:2025, difficulty:'Medium', frequency:87, hint:'Expand around center.' },
  { id:24, title:'Group Anagrams', topic:'Strings', company:'Meta', year:2025, difficulty:'Medium', frequency:85, hint:'Sort each word as key.' },
  { id:25, title:'Minimum Window Substring', topic:'Strings', company:'Google', year:2024, difficulty:'Hard', frequency:89, hint:'Sliding window with char freq map.' },
  { id:26, title:'String to Integer (atoi)', topic:'Strings', company:'Amazon', year:2024, difficulty:'Medium', frequency:72, hint:'Handle whitespace, sign, overflow.' },
  { id:27, title:'Longest Common Prefix', topic:'Strings', company:'Adobe', year:2025, difficulty:'Easy', frequency:68, hint:'Compare char by char vertically.' },
  { id:28, title:'Palindrome Partitioning', topic:'Strings', company:'Google', year:2024, difficulty:'Hard', frequency:74, hint:'Backtracking + palindrome check.' },
  { id:29, title:'Implement strStr() / KMP', topic:'Strings', company:'Microsoft', year:2025, difficulty:'Hard', frequency:70, hint:'KMP failure function.' },
  { id:30, title:'Decode Ways', topic:'Strings', company:'Flipkart', year:2024, difficulty:'Medium', frequency:78, hint:'DP — 1 digit or 2 digit decode.' },
  { id:31, title:'Zigzag Conversion', topic:'Strings', company:'Apple', year:2025, difficulty:'Medium', frequency:65, hint:'Row-by-row simulation.' },
  { id:32, title:'Count and Say', topic:'Strings', company:'Goldman Sachs', year:2024, difficulty:'Medium', frequency:63, hint:'Iterate and describe previous.' },
  { id:33, title:'Rabin-Karp Pattern Matching', topic:'Strings', company:'Uber', year:2025, difficulty:'Hard', frequency:71, hint:'Rolling hash comparison.' },
  { id:34, title:'Edit Distance', topic:'Strings', company:'Google', year:2024, difficulty:'Hard', frequency:82, hint:'2D DP — insert, delete, replace.' },
  { id:35, title:'Valid Anagram', topic:'Strings', company:'Amazon', year:2025, difficulty:'Easy', frequency:76, hint:'Count character frequencies.' },
  { id:36, title:'Reverse Words in a String', topic:'Strings', company:'Microsoft', year:2025, difficulty:'Medium', frequency:74, hint:'Split, reverse, join.' },
  { id:37, title:'Repeated DNA Sequences', topic:'Strings', company:'Meta', year:2024, difficulty:'Medium', frequency:67, hint:'HashSet on 10-char substrings.' },
  { id:38, title:'Wildcard Matching', topic:'Strings', company:'Amazon', year:2024, difficulty:'Hard', frequency:73, hint:'DP with * handling.' },
  { id:39, title:'Letter Combinations of a Phone Number', topic:'Strings', company:'Paytm', year:2025, difficulty:'Medium', frequency:75, hint:'Backtracking with digit map.' },
  { id:40, title:'Roman to Integer', topic:'Strings', company:'Apple', year:2025, difficulty:'Easy', frequency:69, hint:'Map values, subtract if smaller.' },

  // ══════════════════════════════════
  // LINKED LIST (20)
  // ══════════════════════════════════
  { id:41, title:'Reverse Linked List', topic:'Linked List', company:'Google', year:2024, difficulty:'Easy', frequency:95, hint:'Three pointers: prev, curr, next.' },
  { id:42, title:'Merge Two Sorted Lists', topic:'Linked List', company:'Amazon', year:2025, difficulty:'Easy', frequency:90, hint:'Dummy head, compare and link.' },
  { id:43, title:'Detect Loop in linked list', topic:'Linked List', company:'Microsoft', year:2024, difficulty:'Easy', frequency:88, hint:'Floyd\'s tortoise and hare.' },
  { id:44, title:'Remove Nth Node From End', topic:'Linked List', company:'Meta', year:2024, difficulty:'Medium', frequency:84, hint:'Two pointers with n gap.' },
  { id:45, title:'Add Two Numbers', topic:'Linked List', company:'Google', year:2025, difficulty:'Medium', frequency:87, hint:'Digit by digit with carry.' },
  { id:46, title:'Flatten a Multilevel Doubly Linked List', topic:'Linked List', company:'Amazon', year:2025, difficulty:'Medium', frequency:72, hint:'DFS/stack approach.' },
  { id:47, title:'Copy List with Random Pointer', topic:'Linked List', company:'Microsoft', year:2024, difficulty:'Medium', frequency:81, hint:'HashMap old→new or interleave.' },
  { id:48, title:'LRU Cache', topic:'Linked List', company:'Google', year:2025, difficulty:'Hard', frequency:93, hint:'HashMap + doubly linked list.' },
  { id:49, title:'Merge K Sorted Lists', topic:'Linked List', company:'Amazon', year:2024, difficulty:'Hard', frequency:88, hint:'Min heap of k heads.' },
  { id:50, title:'Reverse Nodes in k-Group', topic:'Linked List', company:'Meta', year:2024, difficulty:'Hard', frequency:79, hint:'Count k, reverse, recurse.' },
  { id:51, title:'Intersection of Two Linked Lists', topic:'Linked List', company:'Adobe', year:2025, difficulty:'Easy', frequency:76, hint:'Two pointers — switch heads.' },
  { id:52, title:'Palindrome Linked List', topic:'Linked List', company:'Flipkart', year:2025, difficulty:'Medium', frequency:73, hint:'Reverse second half, compare.' },
  { id:53, title:'Sort List (Merge Sort)', topic:'Linked List', company:'Google', year:2024, difficulty:'Medium', frequency:77, hint:'Find mid, merge sort halves.' },
  { id:54, title:'Swap Nodes in Pairs', topic:'Linked List', company:'Apple', year:2025, difficulty:'Medium', frequency:68, hint:'Pairwise pointer swap.' },
  { id:55, title:'Rotate List', topic:'Linked List', company:'Goldman Sachs', year:2024, difficulty:'Medium', frequency:65, hint:'Make circular, break at length-k.' },
  { id:56, title:'Remove Duplicates from Sorted List II', topic:'Linked List', company:'Microsoft', year:2024, difficulty:'Medium', frequency:70, hint:'Dummy node, skip duplicates.' },
  { id:57, title:'Reorder List', topic:'Linked List', company:'Uber', year:2025, difficulty:'Medium', frequency:74, hint:'Find mid, reverse 2nd, merge.' },
  { id:58, title:'Odd Even Linked List', topic:'Linked List', company:'Walmart', year:2025, difficulty:'Medium', frequency:66, hint:'Split odd/even, connect.' },
  { id:59, title:'Design Browser History', topic:'Linked List', company:'Amazon', year:2024, difficulty:'Medium', frequency:71, hint:'Doubly linked list navigation.' },
  { id:60, title:'Linked List Cycle II (Find Start)', topic:'Linked List', company:'Google', year:2025, difficulty:'Medium', frequency:80, hint:'Floyd\'s then reset one pointer.' },

  // ══════════════════════════════════
  // TREES (20)
  // ══════════════════════════════════
  { id:61, title:'Maximum Depth of Binary Tree', topic:'Trees', company:'Amazon', year:2024, difficulty:'Easy', frequency:90, hint:'DFS — max(left, right) + 1.' },
  { id:62, title:'Validate Binary Search Tree', topic:'Trees', company:'Google', year:2025, difficulty:'Medium', frequency:88, hint:'Inorder traversal must be sorted.' },
  { id:63, title:'Binary Tree Level Order Traversal', topic:'Trees', company:'Microsoft', year:2024, difficulty:'Medium', frequency:86, hint:'BFS with queue.' },
  { id:64, title:'Lowest Common Ancestor of BST', topic:'Trees', company:'Meta', year:2024, difficulty:'Medium', frequency:85, hint:'Both left → go left, both right → go right.' },
  { id:65, title:'Binary Tree Zigzag Level Order', topic:'Trees', company:'Amazon', year:2025, difficulty:'Medium', frequency:78, hint:'BFS, alternate reverse.' },
  { id:66, title:'Serialize and Deserialize Binary Tree', topic:'Trees', company:'Google', year:2024, difficulty:'Hard', frequency:84, hint:'Preorder with null markers.' },
  { id:67, title:'Diameter of Binary Tree', topic:'Trees', company:'Meta', year:2025, difficulty:'Easy', frequency:82, hint:'DFS — max at each node.' },
  { id:68, title:'Invert Binary Tree', topic:'Trees', company:'Apple', year:2025, difficulty:'Easy', frequency:87, hint:'Swap left and right recursively.' },
  { id:69, title:'Construct Binary Tree from Preorder and Inorder', topic:'Trees', company:'Microsoft', year:2024, difficulty:'Medium', frequency:79, hint:'First of preorder is root.' },
  { id:70, title:'Binary Tree Maximum Path Sum', topic:'Trees', company:'Google', year:2024, difficulty:'Hard', frequency:83, hint:'DFS, track global max.' },
  { id:71, title:'Kth Smallest Element in BST', topic:'Trees', company:'Amazon', year:2025, difficulty:'Medium', frequency:80, hint:'Inorder traversal, count k.' },
  { id:72, title:'Symmetric Tree', topic:'Trees', company:'Adobe', year:2025, difficulty:'Easy', frequency:74, hint:'Mirror check — left.left == right.right.' },
  { id:73, title:'Path Sum II', topic:'Trees', company:'Flipkart', year:2024, difficulty:'Medium', frequency:72, hint:'DFS with running sum and path list.' },
  { id:74, title:'Count Complete Tree Nodes', topic:'Trees', company:'Goldman Sachs', year:2024, difficulty:'Medium', frequency:68, hint:'Left/right height comparison.' },
  { id:75, title:'Flatten Binary Tree to Linked List', topic:'Trees', company:'Uber', year:2025, difficulty:'Medium', frequency:75, hint:'Preorder — connect right pointers.' },
  { id:76, title:'Binary Tree Right Side View', topic:'Trees', company:'Microsoft', year:2024, difficulty:'Medium', frequency:77, hint:'BFS, take last of each level.' },
  { id:77, title:'Vertical Order Traversal', topic:'Trees', company:'Amazon', year:2025, difficulty:'Hard', frequency:73, hint:'BFS with column index.' },
  { id:78, title:'Subtree of Another Tree', topic:'Trees', company:'Google', year:2024, difficulty:'Easy', frequency:76, hint:'Check isSubtree at each node.' },
  { id:79, title:'Populating Next Right Pointers', topic:'Trees', company:'Meta', year:2025, difficulty:'Medium', frequency:70, hint:'BFS or O(1) space with next pointers.' },
  { id:80, title:'Morris Inorder Traversal', topic:'Trees', company:'Google', year:2024, difficulty:'Hard', frequency:65, hint:'Threading — no stack needed.' },

  // ══════════════════════════════════
  // GRAPHS (20)
  // ══════════════════════════════════
  { id:81, title:'Number of Islands', topic:'Graphs', company:'Amazon', year:2025, difficulty:'Medium', frequency:93, hint:'BFS/DFS flood fill.' },
  { id:82, title:'Course Schedule (Cycle Detection)', topic:'Graphs', company:'Google', year:2024, difficulty:'Medium', frequency:88, hint:'Topological sort / DFS cycle.' },
  { id:83, title:'Clone Graph', topic:'Graphs', company:'Meta', year:2025, difficulty:'Medium', frequency:82, hint:'BFS + HashMap old→new.' },
  { id:84, title:'Word Ladder', topic:'Graphs', company:'Amazon', year:2025, difficulty:'Hard', frequency:80, hint:'BFS — change 1 char at a time.' },
  { id:85, title:'Dijkstra\'s Shortest Path', topic:'Graphs', company:'Google', year:2024, difficulty:'Hard', frequency:85, hint:'Priority queue + relaxation.' },
  { id:86, title:'Detect Cycle in Undirected Graph', topic:'Graphs', company:'Microsoft', year:2024, difficulty:'Medium', frequency:79, hint:'Union-Find or DFS with parent.' },
  { id:87, title:'Topological Sort (Kahn\'s)', topic:'Graphs', company:'Uber', year:2025, difficulty:'Medium', frequency:81, hint:'Indegree array + BFS.' },
  { id:88, title:'Surrounded Regions', topic:'Graphs', company:'Amazon', year:2025, difficulty:'Medium', frequency:74, hint:'DFS from border O\'s.' },
  { id:89, title:'Cheapest Flights Within K Stops', topic:'Graphs', company:'Google', year:2024, difficulty:'Hard', frequency:77, hint:'Modified Dijkstra with stop count.' },
  { id:90, title:'Network Delay Time', topic:'Graphs', company:'Meta', year:2025, difficulty:'Medium', frequency:76, hint:'Dijkstra from source, max dist.' },
  { id:91, title:'Pacific Atlantic Water Flow', topic:'Graphs', company:'Microsoft', year:2024, difficulty:'Medium', frequency:73, hint:'Reverse BFS from both oceans.' },
  { id:92, title:'Alien Dictionary', topic:'Graphs', company:'Google', year:2024, difficulty:'Hard', frequency:78, hint:'Build graph from word order, topo sort.' },
  { id:93, title:'Critical Connections (Bridges)', topic:'Graphs', company:'Amazon', year:2025, difficulty:'Hard', frequency:72, hint:'Tarjan\'s algorithm.' },
  { id:94, title:'Rotting Oranges', topic:'Graphs', company:'Flipkart', year:2024, difficulty:'Medium', frequency:83, hint:'Multi-source BFS.' },
  { id:95, title:'Minimum Spanning Tree (Prim\'s)', topic:'Graphs', company:'Goldman Sachs', year:2025, difficulty:'Hard', frequency:70, hint:'Greedy + priority queue.' },
  { id:96, title:'Graph Valid Tree', topic:'Graphs', company:'Apple', year:2024, difficulty:'Medium', frequency:68, hint:'n-1 edges + no cycle.' },
  { id:97, title:'Accounts Merge', topic:'Graphs', company:'Amazon', year:2025, difficulty:'Medium', frequency:75, hint:'Union-Find on email groups.' },
  { id:98, title:'Shortest Path in Binary Matrix', topic:'Graphs', company:'Uber', year:2024, difficulty:'Medium', frequency:71, hint:'BFS — 8 directions.' },
  { id:99, title:'Reconstruct Itinerary', topic:'Graphs', company:'Google', year:2025, difficulty:'Hard', frequency:69, hint:'Euler path — Hierholzer\'s.' },
  { id:100, title:'Is Graph Bipartite?', topic:'Graphs', company:'Adobe', year:2025, difficulty:'Medium', frequency:67, hint:'BFS/DFS 2-coloring.' },

  // ══════════════════════════════════
  // DYNAMIC PROGRAMMING (20)
  // ══════════════════════════════════
  { id:101, title:'Climbing Stairs', topic:'Dynamic Programming', company:'Amazon', year:2024, difficulty:'Easy', frequency:90, hint:'dp[i] = dp[i-1] + dp[i-2].' },
  { id:102, title:'Coin Change', topic:'Dynamic Programming', company:'Google', year:2025, difficulty:'Medium', frequency:88, hint:'Bottom-up DP on amount.' },
  { id:103, title:'Longest Increasing Subsequence', topic:'Dynamic Programming', company:'Microsoft', year:2024, difficulty:'Medium', frequency:86, hint:'DP O(n²) or binary search O(n log n).' },
  { id:104, title:'0/1 Knapsack', topic:'Dynamic Programming', company:'Flipkart', year:2025, difficulty:'Medium', frequency:89, hint:'Pick or skip each item.' },
  { id:105, title:'Word Break', topic:'Dynamic Programming', company:'Meta', year:2024, difficulty:'Medium', frequency:84, hint:'DP — can prefix be broken?' },
  { id:106, title:'Longest Common Subsequence', topic:'Dynamic Programming', company:'Google', year:2024, difficulty:'Medium', frequency:82, hint:'2D DP on both strings.' },
  { id:107, title:'House Robber', topic:'Dynamic Programming', company:'Amazon', year:2025, difficulty:'Medium', frequency:85, hint:'dp[i] = max(dp[i-1], dp[i-2]+nums[i]).' },
  { id:108, title:'Unique Paths', topic:'Dynamic Programming', company:'Apple', year:2025, difficulty:'Medium', frequency:77, hint:'Grid DP — sum top + left.' },
  { id:109, title:'Partition Equal Subset Sum', topic:'Dynamic Programming', company:'Amazon', year:2024, difficulty:'Medium', frequency:79, hint:'Subset sum = totalSum/2.' },
  { id:110, title:'Matrix Chain Multiplication', topic:'Dynamic Programming', company:'Goldman Sachs', year:2024, difficulty:'Hard', frequency:73, hint:'Interval DP — try all splits.' },
  { id:111, title:'Burst Balloons', topic:'Dynamic Programming', company:'Google', year:2025, difficulty:'Hard', frequency:74, hint:'Interval DP — last balloon popped.' },
  { id:112, title:'Minimum Path Sum', topic:'Dynamic Programming', company:'Microsoft', year:2025, difficulty:'Medium', frequency:76, hint:'DP grid — min(top, left) + current.' },
  { id:113, title:'Decode Ways', topic:'Dynamic Programming', company:'Uber', year:2024, difficulty:'Medium', frequency:78, hint:'1 or 2 digit decode possibilities.' },
  { id:114, title:'Palindrome Partitioning II', topic:'Dynamic Programming', company:'Google', year:2025, difficulty:'Hard', frequency:71, hint:'DP — min cuts for palindrome substrings.' },
  { id:115, title:'Maximal Square', topic:'Dynamic Programming', company:'Meta', year:2024, difficulty:'Medium', frequency:80, hint:'dp[i][j] = min(3 neighbors) + 1.' },
  { id:116, title:'Interleaving String', topic:'Dynamic Programming', company:'Amazon', year:2025, difficulty:'Hard', frequency:68, hint:'2D DP — take from s1 or s2.' },
  { id:117, title:'Regular Expression Matching', topic:'Dynamic Programming', company:'Google', year:2024, difficulty:'Hard', frequency:76, hint:'2D DP with . and * handling.' },
  { id:118, title:'Target Sum', topic:'Dynamic Programming', company:'Paytm', year:2025, difficulty:'Medium', frequency:74, hint:'Subset sum variant.' },
  { id:119, title:'Longest Palindromic Subsequence', topic:'Dynamic Programming', company:'Microsoft', year:2024, difficulty:'Medium', frequency:72, hint:'LCS of string and its reverse.' },
  { id:120, title:'Egg Drop Problem', topic:'Dynamic Programming', company:'Google', year:2025, difficulty:'Hard', frequency:70, hint:'Binary search + DP on floors.' },

  // ══════════════════════════════════
  // STACK & QUEUE (20)
  // ══════════════════════════════════
  { id:121, title:'Min Stack', topic:'Stack & Queue', company:'Amazon', year:2024, difficulty:'Medium', frequency:87, hint:'Two stacks — main + min tracker.' },
  { id:122, title:'Largest Rectangle in Histogram', topic:'Stack & Queue', company:'Google', year:2025, difficulty:'Hard', frequency:84, hint:'Monotonic stack.' },
  { id:123, title:'Daily Temperatures', topic:'Stack & Queue', company:'Microsoft', year:2024, difficulty:'Medium', frequency:82, hint:'Monotonic decreasing stack.' },
  { id:124, title:'Evaluate Reverse Polish Notation', topic:'Stack & Queue', company:'Meta', year:2024, difficulty:'Medium', frequency:76, hint:'Stack — push nums, pop on operator.' },
  { id:125, title:'Implement Queue using Stacks', topic:'Stack & Queue', company:'Apple', year:2025, difficulty:'Easy', frequency:79, hint:'Two stacks — push/pop stack.' },
  { id:126, title:'Next Greater Element I', topic:'Stack & Queue', company:'Amazon', year:2024, difficulty:'Easy', frequency:74, hint:'Monotonic stack + hashmap.' },
  { id:127, title:'Sliding Window Maximum', topic:'Stack & Queue', company:'Google', year:2025, difficulty:'Hard', frequency:86, hint:'Monotonic deque.' },
  { id:128, title:'Design Circular Queue', topic:'Stack & Queue', company:'Uber', year:2024, difficulty:'Medium', frequency:68, hint:'Array with front/rear pointers.' },
  { id:129, title:'Asteroid Collision', topic:'Stack & Queue', company:'Adobe', year:2025, difficulty:'Medium', frequency:72, hint:'Stack — process collisions.' },
  { id:130, title:'Basic Calculator II', topic:'Stack & Queue', company:'Microsoft', year:2024, difficulty:'Medium', frequency:78, hint:'Stack with operator precedence.' },
  { id:131, title:'Remove All Adjacent Duplicates', topic:'Stack & Queue', company:'Flipkart', year:2025, difficulty:'Easy', frequency:65, hint:'Stack — push or pop if match.' },
  { id:132, title:'Online Stock Span', topic:'Stack & Queue', company:'Goldman Sachs', year:2025, difficulty:'Medium', frequency:70, hint:'Monotonic stack of (price, span).' },
  { id:133, title:'Decode String', topic:'Stack & Queue', company:'Google', year:2024, difficulty:'Medium', frequency:80, hint:'Stack for nested brackets.' },
  { id:134, title:'Car Fleet', topic:'Stack & Queue', company:'Amazon', year:2024, difficulty:'Medium', frequency:71, hint:'Sort by position, stack by time.' },
  { id:135, title:'Maximal Rectangle', topic:'Stack & Queue', company:'Google', year:2025, difficulty:'Hard', frequency:75, hint:'Histogram per row + stack.' },
  { id:136, title:'Task Scheduler', topic:'Stack & Queue', company:'Meta', year:2024, difficulty:'Medium', frequency:81, hint:'Greedy — max frequency first.' },
  { id:137, title:'Remove K Digits', topic:'Stack & Queue', company:'Paytm', year:2025, difficulty:'Medium', frequency:73, hint:'Monotonic increasing stack.' },
  { id:138, title:'Simplify Path', topic:'Stack & Queue', company:'Microsoft', year:2025, difficulty:'Medium', frequency:67, hint:'Stack — handle . and ..' },
  { id:139, title:'Number of Visible People in a Queue', topic:'Stack & Queue', company:'Uber', year:2024, difficulty:'Hard', frequency:66, hint:'Monotonic stack from right.' },
  { id:140, title:'Trapping Rain Water (Stack)', topic:'Stack & Queue', company:'Amazon', year:2025, difficulty:'Hard', frequency:83, hint:'Stack-based approach.' },

  // ══════════════════════════════════
  // SORTING & SEARCHING (20)
  // ══════════════════════════════════
  { id:141, title:'Binary Search', topic:'Sorting & Searching', company:'Google', year:2024, difficulty:'Easy', frequency:92, hint:'lo, hi, mid — standard template.' },
  { id:142, title:'Search in Rotated Sorted Array', topic:'Sorting & Searching', company:'Amazon', year:2025, difficulty:'Medium', frequency:89, hint:'Binary search — find sorted half.' },
  { id:143, title:'Merge Sort', topic:'Sorting & Searching', company:'Microsoft', year:2024, difficulty:'Medium', frequency:80, hint:'Divide, sort, merge.' },
  { id:144, title:'Kth Largest Element', topic:'Sorting & Searching', company:'Meta', year:2024, difficulty:'Medium', frequency:87, hint:'Quickselect or min-heap.' },
  { id:145, title:'Find Peak Element', topic:'Sorting & Searching', company:'Google', year:2025, difficulty:'Medium', frequency:78, hint:'Binary search — go towards higher neighbor.' },
  { id:146, title:'Search a 2D Matrix', topic:'Sorting & Searching', company:'Amazon', year:2025, difficulty:'Medium', frequency:76, hint:'Treat as 1D sorted array.' },
  { id:147, title:'Count of Smaller Numbers After Self', topic:'Sorting & Searching', company:'Google', year:2024, difficulty:'Hard', frequency:74, hint:'Merge sort + count inversions.' },
  { id:148, title:'Top K Frequent Elements', topic:'Sorting & Searching', company:'Amazon', year:2025, difficulty:'Medium', frequency:85, hint:'Bucket sort or min-heap.' },
  { id:149, title:'Sort Colors (Dutch National Flag)', topic:'Sorting & Searching', company:'Microsoft', year:2024, difficulty:'Medium', frequency:82, hint:'Three pointers — lo, mid, hi.' },
  { id:150, title:'Aggressive Cows / Magnetic Balls', topic:'Sorting & Searching', company:'Flipkart', year:2025, difficulty:'Hard', frequency:77, hint:'Binary search on answer.' },
  { id:151, title:'Find First and Last Position', topic:'Sorting & Searching', company:'Uber', year:2024, difficulty:'Medium', frequency:79, hint:'Two binary searches — left & right.' },
  { id:152, title:'Sqrt(x)', topic:'Sorting & Searching', company:'Apple', year:2025, difficulty:'Easy', frequency:72, hint:'Binary search on [0, x].' },
  { id:153, title:'Allocate Minimum Pages', topic:'Sorting & Searching', company:'Goldman Sachs', year:2024, difficulty:'Hard', frequency:76, hint:'Binary search on max pages.' },
  { id:154, title:'Capacity To Ship Packages', topic:'Sorting & Searching', company:'Amazon', year:2025, difficulty:'Medium', frequency:75, hint:'Binary search on capacity.' },
  { id:155, title:'H-Index', topic:'Sorting & Searching', company:'Google', year:2024, difficulty:'Medium', frequency:64, hint:'Sort desc, find h = min(i+1, citations[i]).' },
  { id:156, title:'Smallest Rectangle Enclosing Black Pixels', topic:'Sorting & Searching', company:'Meta', year:2024, difficulty:'Hard', frequency:62, hint:'Binary search on boundaries.' },
  { id:157, title:'Count Inversions (Merge Sort)', topic:'Sorting & Searching', company:'Paytm', year:2025, difficulty:'Hard', frequency:78, hint:'Modified merge sort.' },
  { id:158, title:'Wiggle Sort II', topic:'Sorting & Searching', company:'Adobe', year:2025, difficulty:'Medium', frequency:66, hint:'Find median, 3-way partition.' },
  { id:159, title:'Painters Partition Problem', topic:'Sorting & Searching', company:'Razorpay', year:2024, difficulty:'Hard', frequency:74, hint:'Binary search on max work.' },
  { id:160, title:'Search in Rotated Sorted Array II', topic:'Sorting & Searching', company:'Walmart', year:2024, difficulty:'Medium', frequency:70, hint:'Handle duplicates in binary search.' },

  // ══════════════════════════════════
  // RECURSION & BACKTRACKING (20)
  // ══════════════════════════════════
  { id:161, title:'Permutations', topic:'Recursion & Backtracking', company:'Google', year:2025, difficulty:'Medium', frequency:88, hint:'Swap-based or used[] array.' },
  { id:162, title:'Subsets', topic:'Recursion & Backtracking', company:'Amazon', year:2024, difficulty:'Medium', frequency:85, hint:'Include/exclude at each index.' },
  { id:163, title:'Combination Sum', topic:'Recursion & Backtracking', company:'Microsoft', year:2025, difficulty:'Medium', frequency:83, hint:'Backtrack with remaining target.' },
  { id:164, title:'N-Queens', topic:'Recursion & Backtracking', company:'Google', year:2024, difficulty:'Hard', frequency:82, hint:'Col + diagonal sets.' },
  { id:165, title:'Word Search', topic:'Recursion & Backtracking', company:'Meta', year:2025, difficulty:'Medium', frequency:86, hint:'DFS on grid with visited.' },
  { id:166, title:'Sudoku Solver', topic:'Recursion & Backtracking', company:'Amazon', year:2025, difficulty:'Hard', frequency:79, hint:'Try 1-9, validate, backtrack.' },
  { id:167, title:'Generate Parentheses', topic:'Recursion & Backtracking', company:'Google', year:2024, difficulty:'Medium', frequency:84, hint:'Track open/close counts.' },
  { id:168, title:'Rat in a Maze', topic:'Recursion & Backtracking', company:'Flipkart', year:2025, difficulty:'Medium', frequency:80, hint:'DFS with path array.' },
  { id:169, title:'Palindrome Partitioning', topic:'Recursion & Backtracking', company:'Apple', year:2024, difficulty:'Medium', frequency:74, hint:'Check palindrome, recurse on rest.' },
  { id:170, title:'Combination Sum II', topic:'Recursion & Backtracking', company:'Uber', year:2024, difficulty:'Medium', frequency:76, hint:'Sort + skip duplicates.' },
  { id:171, title:'Power Set', topic:'Recursion & Backtracking', company:'Adobe', year:2025, difficulty:'Medium', frequency:72, hint:'Bit masking or recursion.' },
  { id:172, title:'Word Search II (Trie + Backtrack)', topic:'Recursion & Backtracking', company:'Google', year:2025, difficulty:'Hard', frequency:78, hint:'Build trie, DFS on grid.' },
  { id:173, title:'Expression Add Operators', topic:'Recursion & Backtracking', company:'Meta', year:2024, difficulty:'Hard', frequency:71, hint:'Track prev operand for *.' },
  { id:174, title:'Beautiful Arrangement', topic:'Recursion & Backtracking', company:'Goldman Sachs', year:2024, difficulty:'Medium', frequency:65, hint:'Backtrack with divisibility check.' },
  { id:175, title:'Restore IP Addresses', topic:'Recursion & Backtracking', company:'Amazon', year:2025, difficulty:'Medium', frequency:73, hint:'4 parts, each 0-255.' },
  { id:176, title:'M-Coloring Problem', topic:'Recursion & Backtracking', company:'Flipkart', year:2025, difficulty:'Medium', frequency:75, hint:'Try colors, check adjacent.' },
  { id:177, title:'Knight\'s Tour', topic:'Recursion & Backtracking', company:'Microsoft', year:2024, difficulty:'Hard', frequency:63, hint:'Warnsdorff\'s rule or plain backtrack.' },
  { id:178, title:'Unique Binary Search Trees II', topic:'Recursion & Backtracking', company:'Google', year:2024, difficulty:'Medium', frequency:68, hint:'For each root, recurse left/right ranges.' },
  { id:179, title:'Letter Case Permutation', topic:'Recursion & Backtracking', company:'Paytm', year:2025, difficulty:'Medium', frequency:70, hint:'At each alpha, branch upper/lower.' },
  { id:180, title:'Partition to K Equal Sum Subsets', topic:'Recursion & Backtracking', company:'Amazon', year:2024, difficulty:'Hard', frequency:72, hint:'Backtrack with k buckets.' },

  // ══════════════════════════════════
  // HASHING (20)
  // ══════════════════════════════════
  { id:181, title:'Two Sum (HashMap)', topic:'Hashing', company:'Google', year:2025, difficulty:'Easy', frequency:98, hint:'Complement lookup in map.' },
  { id:182, title:'Longest Consecutive Sequence', topic:'Hashing', company:'Amazon', year:2024, difficulty:'Medium', frequency:84, hint:'HashSet — only start from sequence head.' },
  { id:183, title:'Group Anagrams', topic:'Hashing', company:'Meta', year:2025, difficulty:'Medium', frequency:83, hint:'Sorted word as key.' },
  { id:184, title:'Subarray Sum Equals K', topic:'Hashing', company:'Google', year:2024, difficulty:'Medium', frequency:86, hint:'Prefix sum difference in map.' },
  { id:185, title:'Contains Duplicate', topic:'Hashing', company:'Microsoft', year:2025, difficulty:'Easy', frequency:78, hint:'HashSet — check existence.' },
  { id:186, title:'Intersection of Two Arrays II', topic:'Hashing', company:'Amazon', year:2024, difficulty:'Easy', frequency:74, hint:'Count frequencies in map.' },
  { id:187, title:'4Sum II', topic:'Hashing', company:'Google', year:2025, difficulty:'Medium', frequency:72, hint:'Store A+B sums, find -(C+D).' },
  { id:188, title:'Top K Frequent Elements', topic:'Hashing', company:'Meta', year:2024, difficulty:'Medium', frequency:85, hint:'HashMap + bucket sort.' },
  { id:189, title:'Valid Sudoku', topic:'Hashing', company:'Apple', year:2025, difficulty:'Medium', frequency:70, hint:'HashSet for row, col, box.' },
  { id:190, title:'Isomorphic Strings', topic:'Hashing', company:'Adobe', year:2025, difficulty:'Easy', frequency:66, hint:'Two maps — char mapping both ways.' },
  { id:191, title:'Minimum Window Substring', topic:'Hashing', company:'Amazon', year:2024, difficulty:'Hard', frequency:82, hint:'Sliding window + freq map.' },
  { id:192, title:'Design HashMap', topic:'Hashing', company:'Microsoft', year:2025, difficulty:'Easy', frequency:73, hint:'Array of linked lists.' },
  { id:193, title:'Copy List with Random Pointer', topic:'Hashing', company:'Google', year:2024, difficulty:'Medium', frequency:79, hint:'HashMap old → clone.' },
  { id:194, title:'Find duplicates in an array', topic:'Hashing', company:'Uber', year:2024, difficulty:'Medium', frequency:77, hint:'Sliding window + freq comparison.' },
  { id:195, title:'Longest Substring Without Repeating Characters', topic:'Hashing', company:'Amazon', year:2025, difficulty:'Medium', frequency:91, hint:'Sliding window + HashSet.' },
  { id:196, title:'Count Primes (Sieve)', topic:'Hashing', company:'Goldman Sachs', year:2025, difficulty:'Medium', frequency:64, hint:'Sieve of Eratosthenes.' },
  { id:197, title:'Happy Number', topic:'Hashing', company:'Flipkart', year:2024, difficulty:'Easy', frequency:62, hint:'HashSet to detect cycle.' },
  { id:198, title:'First Unique Character in a String', topic:'Hashing', company:'Walmart', year:2024, difficulty:'Easy', frequency:71, hint:'Count freq, find first with 1.' },
  { id:199, title:'Contiguous Array (0s and 1s)', topic:'Hashing', company:'Paytm', year:2025, difficulty:'Medium', frequency:75, hint:'Prefix sum map — treat 0 as -1.' },
  { id:200, title:'LFU Cache', topic:'Hashing', company:'Google', year:2024, difficulty:'Hard', frequency:70, hint:'HashMap + freq buckets + DLL.' },
]

export { questions, COMPANIES, TOPICS, DIFFICULTIES }
