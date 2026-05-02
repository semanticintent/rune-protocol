# Rune in Mere

Mere is the origin host for the Rune protocol. Every `.mp.html` workbook is a Level 3 Rune document.

## Task List

```html
<state>
  <value name="tasks" type="list" value="[]"/>
  <value name="new-task" type="text" value=""/>
</state>

<computed>
  <value name="pending" from="tasks" where="done = false"/>
</computed>

<actions>
  <action name="add-task">
    add-to tasks title @new-task done false
    clear new-task
  </action>
  <action name="complete-task" takes="id">
    set tasks.done to true where id = id
  </action>
</actions>

<screen name="home" ?"simple task list, input at top, pending tasks below">
  <heading>Tasks</heading>
  <badge @pending-count/>

  <field ~new-task placeholder="New task…"/>      <!-- ~ sync: user types → state -->
  <button !add-task>Add</button>                  <!-- ! act: explicit trigger -->

  <card-list @pending>                            <!-- @ read: iterate list -->
    <card !complete-task with item.id>
      <heading @item.title/>                      <!-- @ read: display field -->
    </card>
  </card-list>
</screen>
```

All four runes in 30 lines. Complete reactive application.
