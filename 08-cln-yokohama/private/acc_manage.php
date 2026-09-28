<?php include 'ui/header.php'; ?>

<a href="acc_create.php">click</a>
<?php alertMessage(); ?>
<div class="container">
    <div class="card">
        <h2 class="mb-4">Manage Accounts</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                // Fetch accounts from the database
                $accounts = getAll('users'); // Assuming 'users' is the table name
                foreach ($accounts as $account) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($account['name']) . '</td>';
                    echo '<td>' . htmlspecialchars($account['email']) . '</td>';
                    echo '<td>' . htmlspecialchars($account['role']) . '</td>';
                    echo '<td>' . ($account['status'] ? 'Inactive' : 'Active') . '</td>';
                    echo '<td><a href="acc_edit.php?id=' . $account['id'] . '" class="btn btn-secondary">Edit</a></td>';
                    echo '</tr>';
                }
                ?>
            </tbody>
        </table>
    </div>

<?php include 'ui/footer.php'; ?>